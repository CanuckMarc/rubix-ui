import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
  OnConnectStartParams,
  useEdgesState,
  useNodesState,
  XYPosition,
} from "react-flow-renderer/nocss";
import useUndoable from "use-undoable";
import cx from "classnames";
import { Box, boxesIntersect, useSelectionContainer } from "@air/react-drag-to-select";

import MiniMap from "./components/MiniMap";
import BehaveControls from "./components/Controls";
import NodePicker from "./components/NodePicker";
import NodeMenu from "./components/NodeMenu";
import { Node as NodePanel } from "./components/Node";
import { calculateNewEdge } from "./util/calculateNewEdge";
import { getNodePickerFilters } from "./util/getPickerFilters";
import { CustomEdge } from "./components/CustomEdge";
import { generateUuid } from "./lib/generateUuid";
import { Edge, ReactFlowInstance, ReactFlowProvider } from "react-flow-renderer";
import { convertDataSpec, getNodeSpecDetail, useNodesSpec } from "./use-nodes-spec";
import { Spin } from "antd";
import { NodeSpecJSON } from "./lib";
import { FlowFactory } from "./factory";
import { behaveToFlow } from "./transformers/behaveToFlow";
import ControlUndoable from "./components/ControlUndoable";
import { NodeInterface } from "./lib/Nodes/NodeInterface";
import { handleGetSettingType, handleNodesEmptySettings } from "./util/handleSettings";
import { useParams } from "react-router-dom";
import { getFlowSettings, FLOW_SETTINGS, FlowSettings } from "./components/FlowSettingsModal";
import { NodeSideBar } from "./components/NodeSidebar";
import "./rubix-flow.css";
import { categoryColorMap } from "./util/colors";
import { NodeCategory } from "./lib/Nodes/NodeCategory";
import { useOnPressKey } from "./hooks/useOnPressKey";
import { handleCopyNodesAndEdges } from "./util/handleNodesAndEdges";
import { isValidConnection, isInputExistConnection } from "./util/isCanConnection";
import { flowToBehave } from "./transformers/flowToBehave";
import { uniqArray } from "../../utils/utils";

const edgeTypes = {
  default: CustomEdge,
};

type SelectableBoxType = {
  edgeId: string;
  rect: DOMRect | null;
};

// this is save all nodes
declare global {
  interface Window {
    allNodes: NodeInterface[];
    allEdges: Edge[]
  }
}

const Flow = (props: any) => {
  const { customNodeTypes } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([] as NodeInterface[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [shouldUpdateMiniMap, setShouldUpdateMiniMap] = useState(false);
  const [selectedNode, setSelectedNode] = useState({} as any);
  const [selectedNodeForSubFlow, setSelectedNodeForSubFlow] = useState<NodeInterface | undefined>(undefined);
  const [currentNodesAndEdges, setCurrentNodesAndEdges] = useState({ nodes, edges });
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>();
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>();
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>();
  const refreshInterval = useRef<null | any>(null);
  const [undoable, setUndoable, { past, undo, canUndo, redo, canRedo }] = useUndoable({ nodes: nodes, edges: edges });
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [flowSettings, setFlowSettings] = useState(getFlowSettings());
  const rubixFlowWrapper = useRef<null | any>(null);
  const [rubixFlowInstance, setRubixFlowInstance] = useState<ReactFlowInstance | any>(null);
  const selectableBoxes = useRef<SelectableBoxType[]>([]);
  const isDragSelection = useRef<boolean>(false);

  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const [nodesSpec] = useNodesSpec();

  const factory = new FlowFactory();

  const { DragSelection } = useSelectionContainer({
    onSelectionChange: (box: Box) => {
      if (lastConnectStart || isDragSelection.current) return;
      const selectedEdgeIds: string[] = [];
      selectableBoxes.current.forEach((item: SelectableBoxType) => {
        if (item.rect && boxesIntersect(box, item.rect)) {
          selectedEdgeIds.push(item.edgeId);
        }
      });
      handleSelectEdges(selectedEdgeIds);
    },
    onSelectionStart: () => {
      isDragSelection.current = true;
      const elemEdges: SelectableBoxType[] = [];
      edges.forEach((item) => {
        const eleEdgeId = document.getElementById(item.id);
        elemEdges.push({
          edgeId: item.id,
          rect: eleEdgeId?.getBoundingClientRect() || null,
        });
      });
      selectableBoxes.current = elemEdges;
    },
    onSelectionEnd: () => {
      selectableBoxes.current = [];
      isDragSelection.current = true;
    },
  });

  // delete selected wires
  useOnPressKey("Backspace", () => {
    const edgesDeleted = edges.filter((item) => item.selected);
    if (edgesDeleted.length > 0) {
      updateCurrentNodesAndEdges([], edgesDeleted);
    }
  });

  const onMove = () => setShouldUpdateMiniMap((s) => !s);

  const handleAddNode = useCallback(
    async (isParent: boolean, style: any, nodeType: string, position: XYPosition) => {
      closeNodePicker();
      const nodeSettings = await handleGetSettingType(connUUID, hostUUID, isRemote, nodeType);
      const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, nodeType);
      const newNode = {
        id: generateUuid(),
        isParent: selectedNodeForSubFlow ? false : isParent,
        style,
        type: nodeType,
        position,
        data: {
          inputs: convertDataSpec(spec.inputs || []),
          out: convertDataSpec(spec.outputs || []),
        },
        parentId: selectedNodeForSubFlow?.id || undefined,
        settings: nodeSettings,
      };

      onNodesChange([{ type: "add", item: newNode }]);

      if (lastConnectStart === undefined) return;

      // add an edge if we started on a socket
      const originNode = nodes.find((node) => node.id === lastConnectStart.nodeId);
      if (originNode === undefined) return;

      const newEdge = calculateNewEdge(originNode, nodeType, newNode.id, lastConnectStart);

      if (newEdge.targetHandle && isInputExistConnection(edges, newEdge.target, newEdge.targetHandle)) {
        return;
      }

      onEdgesChange([{ type: "add", item: newEdge }]);
    },
    [lastConnectStart, nodes, onEdgesChange, onNodesChange]
  );

  const handleAddSubFlow = (node: NodeInterface) => {
    setSelectedNodeForSubFlow(node);
    // save current data
    setCurrentNodesAndEdges({
      nodes: [...nodes],
      edges: [...edges],
    });

    const subNodes = nodes.filter((nodeItem: NodeInterface) => nodeItem.parentId === node.id);
    const subEdges = edges.filter((edgeItem) => {
      const haveEdge = subNodes.find((nodeItem: NodeInterface) =>
        [edgeItem.source, edgeItem.target].includes(nodeItem.id)
      );
      return !!haveEdge;
    });
    setNodes(subNodes);
    setEdges(subEdges);
  };

  const getAllNodesAndEdges = () => {
    const oldsNodes = currentNodesAndEdges.nodes.filter((node: NodeInterface) => {
      const nodeExist = nodes.find((nodeItem) => node.id === nodeItem.id);
      return !nodeExist;
    });
    const oldsEdges = currentNodesAndEdges.edges.filter((edgeItemOld) => {
      const edge = edges.find((edgeItem) => edgeItemOld.id === edgeItem.id);
      return !edge;
    });
    return {
      nodes: [...oldsNodes, ...nodes],
      edges: [...oldsEdges, ...edges],
    };
  };

  const onClearAllNodes = () => {
    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();
    if (selectedNodeForSubFlow) {
      const nodeIdsCleared = allNodes
        .filter((node: NodeInterface) => node.parentId === selectedNodeForSubFlow.id)
        .map((item) => item.id);
      const edgeIdsCleared = allEdges
        .filter((edge: Edge) => nodeIdsCleared.includes(edge.target) || nodeIdsCleared.includes(edge.source))
        .map((item) => item.id);
      const remainingNodes = allNodes.filter((item) => !nodeIdsCleared.includes(item.id));
      const remainingEdges = allEdges.filter((item: Edge) => !edgeIdsCleared.includes(item.id));
      setNodes(remainingNodes);
      setEdges(remainingEdges);
      setCurrentNodesAndEdges({ nodes: remainingNodes, edges: remainingEdges });
    } else {
      setNodes([]);
      setEdges([]);
    }
  };

  const onSaveSubFlow = () => {
    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();
    setNodes(allNodes);
    setEdges(allEdges);
    setCurrentNodesAndEdges({ nodes: [], edges: [] });
    setSelectedNodeForSubFlow(undefined);
  };

  const onHandelSaveFlow = async () => {
    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();
    const graphJson = flowToBehave(allNodes, allEdges);
    await factory.DownloadFlow(connUUID, hostUUID, isRemote, graphJson, true);

    const newNodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, allNodes);
    setCurrentNodesAndEdges({ nodes: [], edges: [] });
    setNodes(newNodes);
    setEdges(allEdges);
  };

  const handleStartConnect = (e: ReactMouseEvent, params: OnConnectStartParams) => {
    setLastConnectStart(params);
  };

  const onEdgeContextMenu = useCallback(
    (evt: ReactMouseEvent, edge: any) => {
      evt.preventDefault();
      const newEdges = edges.map((item) => (item.id === edge.id ? { ...edge, selected: !item.selected } : item));
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const onConnectEnd = (evt: ReactMouseEvent | any) => {
    const { nodeid: nodeId, handleid: handleId, handlepos: position } = (evt.target as HTMLDivElement).dataset;
    const isTarget = position === "left";

    if (lastConnectStart) {
      const isDragSelected = edges.some((item) => {
        const isChangeTarget =
          lastConnectStart.handleType === "target" && item.targetHandle === lastConnectStart.handleId;
        const isChangeSource = lastConnectStart.handleId === "out" && item.source === lastConnectStart.nodeId;

        return item.selected && (isChangeTarget || isChangeSource);
      });

      const lastHandleId = lastConnectStart.handleId;
      const isTrueHandleId =
        handleId &&
        lastHandleId &&
        ((handleId.startsWith("in") && lastHandleId.startsWith("in")) ||
          (handleId.startsWith("out") && lastHandleId.startsWith("out")));

      if (isDragSelected && isTrueHandleId) {
        let newEdges;
        if (nodeId) {
          // update selected lines to new node if start and end are same type
          newEdges = edges.map((item) => {
            if (item.selected && lastConnectStart.nodeId === item[lastConnectStart.handleType!!]) {
              const updateKey = isTarget ? "target" : "source";
              item[`${updateKey}Handle`] = handleId;
              item[updateKey] = nodeId;
            }
            return item;
          });
        } else {
          // remove selected lines
          newEdges = edges.filter((item) => !item.selected);
        }

        if (newEdges) {
          setEdges(newEdges);
          setUndoable({
            edges: newEdges,
            nodes,
          });
        }
      } else {
        const element = evt.target as HTMLElement;
        if (element.classList.contains("react-flow__pane")) {
          const { x, y } = setMousePosition(evt);
          setNodePickerVisibility({ x, y });
        }
        /* Add connect for input added by InputCount setting */
        if (
          lastConnectStart &&
          nodeId &&
          handleId &&
          !isTrueHandleId &&
          isValidConnection(nodes, lastConnectStart, { nodeId, handleId })
        ) {
          const isSource = lastConnectStart.handleType === "source" || false;
          const conNodeId = lastConnectStart.nodeId || "";
          const conHandleId = lastConnectStart.handleId || "";
          const target = !isSource ? conNodeId : nodeId;
          const targetHandle = !isSource ? conHandleId : handleId;
          if (isInputExistConnection(edges, target, targetHandle)) {
            return;
          }
          const newEdge = {
            id: generateUuid(),
            source: isSource ? conNodeId : nodeId,
            sourceHandle: isSource ? conHandleId : handleId,
            target: target,
            targetHandle: targetHandle,
          };

          onEdgesChange([
            {
              type: "add",
              item: newEdge,
            },
          ]);
        }
      }
    }

    setLastConnectStart(undefined);
  };

  const closeNodePicker = () => {
    setLastConnectStart(undefined);
    setNodePickerVisibility(undefined);
    setNodeMenuVisibility(undefined);
    setIsDoubleClick(false);
  };

  const handlePaneClick = (e: ReactMouseEvent) => {
    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();
    setNodes(allNodes.map((node) => ({ ...node, selected: false })));
    setEdges(allEdges.map((ed) => ({ ...ed, selected: false })));
    closeNodePicker();
  };

  const onChangeSelection = ({ nodes, edges }: { nodes: NodeInterface[]; edges: Edge[] }) => {
    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();

    const newNodes = allNodes.map((node) => {
      const found = nodes.find((i) => i.id === node.id);
      node.selected = !!found;
      return node;
    });
    const newEdges = allEdges.map((edge) => {
      const found = edges.find((i) => i.id === edge.id);
      edge.selected = !!found;
      return edge;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handlePaneContextMenu = (event: ReactMouseEvent) => {
    const { x, y } = setMousePosition(event);
    setNodePickerVisibility({ x, y });
  };

  const handleNodeContextMenu = (event: React.MouseEvent, node: NodeInterface) => {
    const { x, y } = setMousePosition(event);
    setNodeMenuVisibility({ x, y });
    setSelectedNode(node);
  };

  const setMousePosition = useCallback(
    (event: React.MouseEvent, fromSidebar?: boolean) => {
      event.preventDefault();
      const reactFlowBounds = rubixFlowWrapper.current.getBoundingClientRect();
      if (!fromSidebar) {
        return {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
      } else {
        return rubixFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      }
    },
    [rubixFlowInstance]
  );

  const fetchOutput = async () => {
    try {
      return (await factory.NodeValues(connUUID, hostUUID, isRemote)) || [];
    } catch (error) {
      console.log(error);
    }
  };

  const handleBeforeAddOutput = (nodeInputs: any, inputs: any) => {
    if (!nodeInputs || !inputs) return inputs;

    const oldInputs: any = inputs ? inputs : nodeInputs;
    const newInputs = [...nodeInputs];

    oldInputs.forEach((item: any) => {
      const idx = nodeInputs.findIndex((input: any) => input.pin === item.pin);
      if (idx !== -1) newInputs[idx] = item;
    });

    return newInputs;
  };

  const addOutputToNodes = (outputNodes: Array<any>, prevNodes: Array<any>) => {
    if (outputNodes && outputNodes.length === 0) return prevNodes;

    return prevNodes.map((node: NodeInterface) => {
      const index = outputNodes.findIndex((item) => item.nodeId === node.id);
      if (index > -1) {
        node.data.inputs = !node.data.inputs
          ? outputNodes[index]?.inputs
          : handleBeforeAddOutput(node.data.inputs, outputNodes[index]?.inputs);
        node.data.out = !node.data.out
          ? outputNodes[index]?.outputs
          : handleBeforeAddOutput(node.data.out, outputNodes[index]?.outputs);
        node.status = outputNodes[index]?.status;
        node.info = { ...node.info, ...outputNodes[index]?.info };
      }

      return node;
    });
  };

  const handleNodeDragStop = (e: React.MouseEvent, node: any) => {
    const newNodes = nodes.map((item) => {
      if (item.id === node?.id) {
        item.position = node.position;
      }

      return item;
    });

    setUndoable({
      nodes: newNodes,
      edges: edges,
    });
  };

  const handleRedo = () => {
    redo();
    if (undoable.nodes && undoable.nodes.length === 0) redo();
  };

  const updateCurrentNodesAndEdges = (_nodesDeleted: NodeInterface[], _edgesDeleted: Edge[]) => {
    const nodesWillHandle = selectedNodeForSubFlow ? currentNodesAndEdges.nodes : nodes;
    let edgesWillHandle = selectedNodeForSubFlow ? currentNodesAndEdges.edges : edges;
    const newNodes: NodeInterface[] = _nodesDeleted.length > 0 ? [] : nodesWillHandle;

    _nodesDeleted.forEach((nodeDeleted: NodeInterface) => {
      nodesWillHandle.forEach((nodeHandle: NodeInterface) => {
        const isSelf = nodeDeleted.id === nodeHandle.id;
        if (selectedNodeForSubFlow) {
          if (!isSelf) {
            newNodes.push(nodeHandle);
          }
        } else {
          if (nodeDeleted.isParent && nodeDeleted.id !== nodeHandle.parentId && !isSelf) {
            newNodes.push(nodeHandle);
          } else if (!isSelf) {
            newNodes.push(nodeHandle);
          }
        }
      });
      edgesWillHandle = edgesWillHandle.filter((edge) => {
        if (edge.target === nodeDeleted.id || edge.source === nodeDeleted.id) {
          return false;
        }
        return true;
      });
    });

    const newEdges = edgesWillHandle.filter((currItem) => {
      const item = _edgesDeleted.find((edge: Edge) => edge.id === currItem.id);
      return !item;
    });

    if (selectedNodeForSubFlow) {
      setCurrentNodesAndEdges({
        nodes: newNodes,
        edges: newEdges,
      });
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setUndoable({
      nodes: newNodes,
      edges: newEdges,
    });
  };

  const handleCopyNodes = async (_copied: { nodes: NodeInterface[]; edges: any }) => {
    /* Unselected nodes, edges */
    nodes.forEach((item) => (item.selected = false));
    edges.forEach((item) => (item.selected = false));

    const { nodes: allNodes, edges: allEdges } = getAllNodesAndEdges();

    /*
     * Generate new id of edges copied
     * Add new id source and target of edges copied
     */
    const newFlow = handleCopyNodesAndEdges(_copied, { nodes: allNodes, edges: allEdges });

    newFlow.nodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, newFlow.nodes);
    const _nodes = [...nodes, ...newFlow.nodes, ...allNodes];
    const _edges = [...edges, ...newFlow.edges, ...allEdges];
    const nodesUniq = uniqArray(_nodes);
    const edgesUniq = uniqArray(_edges);

    setNodes(nodesUniq);
    setEdges(edgesUniq);
    setUndoable({ edges: edgesUniq, nodes: nodesUniq });
  };

  const handleRefreshValues = async () => {
    const _outputNodes = (await fetchOutput()) || [];
    setNodes((prevNodes) => addOutputToNodes(_outputNodes, prevNodes));
  };

  const onSaveFlowSettings = (config: FlowSettings) => {
    localStorage.setItem(FLOW_SETTINGS, JSON.stringify(config));
    setFlowSettings(config);
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: any) => {
    const { isParent, nodeType } = JSON.parse(event.dataTransfer.getData("from-node-sidebar"));
    const position = setMousePosition(event, true);
    handleAddNode(isParent, null, nodeType, position);
  };

  const handleMinimapNodeColor = (node: NodeInterface) => {
    if (node.type) {
      const category = node.type.split("/")[0] as NodeCategory;
      return categoryColorMap[category] || "gray";
    }
    return "gray";
  };

  const handleMinimapBorderColor = (node: NodeInterface) => {
    if (node.selected) return "red";
    return "none";
  };

  const onEdgeClick = useCallback(
    (evt: ReactMouseEvent) => {
      const { id } = evt.target as HTMLElement;
      const newEdge = edges.map((item) => {
        item.selected = item.id === id;
        return item;
      });
      setEdges(newEdge);
    },
    [edges, setEdges]
  );

  const handleSelectEdges = (edgeIds: string[]) => {
    const newEdges = edges.map((item) => (edgeIds.includes(item.id) ? { ...item, selected: true } : item));
    setEdges(newEdges);
  };

  const handleInputEmpty = (flowNodes: any, nodes: NodeInterface[], nodesSpec: NodeSpecJSON[]) => {
    try {
      const newNodes: NodeInterface[] = nodes.map((node) => {
        const flowNode = flowNodes.find((item: any) => item.id === node.id);
        if (flowNode && !flowNode.inputs && node.data) {
          const nodeSpec = nodesSpec.find((spec) => spec.type === node.type);
          let inputs: any = {};
          nodeSpec?.inputs?.forEach((item) => {
            inputs = { ...inputs, [item.name]: null };
          });
          return { ...node, data: inputs };
        }
        return node;
      });
      return newNodes;
    } catch (error) {
      return nodes;
    }
  };

  useEffect(() => {
    closeNodePicker();
    factory
      .GetFlow(connUUID, hostUUID, isRemote)
      .then(async (res) => {
        let [_nodes, _edges] = behaveToFlow(res);
        _nodes = handleInputEmpty(res.nodes || [], _nodes, nodesSpec as NodeSpecJSON[]);

        const newNodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, _nodes);

        setNodes(newNodes);
        setEdges(_edges);
        setUndoable({
          nodes: newNodes,
          edges: _edges,
        });

        /* Get output Nodes */
        handleRefreshValues();
      })
      .catch(() => {});
  }, [connUUID, hostUUID]);

  useEffect(() => {
    if (past && past.length !== 0 && undoable.nodes && undoable.nodes.length > 0) {
      setNodes(undoable.nodes);
      setEdges(undoable.edges);
    }
  }, [undoable]);

  useEffect(() => {
    if (selectedNodeForSubFlow) return;

    //When deleting a container, will also delete the nodes that belong to it
    const subNodes = nodes.filter((n: any) => n.parentId) as any[];
    if (subNodes.length === 0) return;

    const allNodeIds = nodes.map((n) => n.id);
    let newNodes = nodes;
    for (const subNode of subNodes) {
      if (!allNodeIds.includes(subNode.parentId)) {
        newNodes = nodes.filter((n) => n.id !== subNode.id);
      }
    }
    setNodes(newNodes);
  }, [nodes, selectedNodeForSubFlow]);

  useEffect(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);

    refreshInterval.current = setInterval(handleRefreshValues, flowSettings.refreshTimeout * 1000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [flowSettings.refreshTimeout]);

  const getNodesAndEdges = useCallback(() => {
    const newNodes = nodes.filter((node: NodeInterface) => {
      if (selectedNodeForSubFlow) {
        return !node.isParent && node.parentId === selectedNodeForSubFlow.id;
      }
      return !node.parentId;
    });
    const newEdges = edges.filter((edge) => {
      const item = newNodes.find((node) => [edge.source, edge.target].includes(node.id));
      return !!item;
    });
    return {
      nodes: newNodes,
      edges: newEdges,
    };
  }, [selectedNodeForSubFlow, nodes, edges]);

  useEffect(() => {
    window.allNodes = nodes;
    window.allEdges = edges;
  }, [nodes, edges]);

  const { nodes: nodesFiltered, edges: edgesFiltered } = getNodesAndEdges();

  return (
    <div className="rubix-flow">
      <ReactFlowProvider>
        <NodeSideBar />
        <div className="rubix-flow__wrapper" ref={rubixFlowWrapper}>
          <ReactFlow
            nodeTypes={customNodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodesFiltered}
            edges={edgesFiltered}
            onMove={onMove}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectionChange={onChangeSelection}
            onEdgeClick={onEdgeClick}
            onConnectStart={handleStartConnect}
            onEdgeContextMenu={onEdgeContextMenu}
            onConnectEnd={onConnectEnd}
            onPaneClick={handlePaneClick}
            onPaneContextMenu={handlePaneContextMenu}
            onNodeContextMenu={handleNodeContextMenu}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setRubixFlowInstance}
            fitView
            deleteKeyCode={["Delete"]}
            onNodeDragStop={handleNodeDragStop}
            multiSelectionKeyCode={["ControlLeft", "ControlRight"]}
          >
            <DragSelection />
            {flowSettings.showMiniMap && (
              <MiniMap
                nodes={nodesFiltered}
                shouldUpdate={shouldUpdateMiniMap}
                className={cx("absolute", {
                  "top-20 right-4": flowSettings.positionMiniMap === "top",
                })}
                nodeColor={handleMinimapNodeColor}
                nodeStrokeColor={handleMinimapBorderColor}
              />
            )}
            <ControlUndoable
              canUndo={canUndo && past && past.length !== 0}
              onUndo={undo}
              canRedo={canRedo}
              onRedo={handleRedo}
            />
            <Controls />
            <Background variant={BackgroundVariant.Lines} color="#353639" style={{ backgroundColor: "#1E1F22" }} />
            <BehaveControls
              onDeleteEdges={updateCurrentNodesAndEdges}
              onCopyNodes={handleCopyNodes}
              onUndo={undo}
              onRedo={handleRedo}
              onRefreshValues={handleRefreshValues}
              settings={flowSettings}
              onSaveSettings={onSaveFlowSettings}
              selectedNodeForSubFlow={selectedNodeForSubFlow}
              onClearAllNodes={onClearAllNodes}
              onSaveSubFlow={onSaveSubFlow}
              onHandelSaveFlow={onHandelSaveFlow}
            />
            {nodePickerVisibility && (
              <NodePicker
                position={nodePickerVisibility}
                filters={getNodePickerFilters(nodesFiltered, lastConnectStart)}
                onPickNode={handleAddNode}
                onClose={closeNodePicker}
              />
            )}
            {nodeMenuVisibility && (
              <NodeMenu
                position={nodeMenuVisibility}
                node={selectedNode}
                onClose={closeNodePicker}
                isDoubleClick={isDoubleClick}
                handleAddSubFlow={handleAddSubFlow}
                selectedNodeForSubFlow={selectedNodeForSubFlow}
              />
            )}
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export const RubixFlow = () => {
  const [nodesSpec, isFetchingNodeSpec] = useNodesSpec();

  const customNodeTypes = (nodesSpec as NodeSpecJSON[]).reduce((nodes, node) => {
    nodes[node.type] = (props: any) => <NodePanel {...props} spec={node} key={node.id} />;
    return nodes;
  }, {} as NodeTypes);

  return <>{isFetchingNodeSpec ? <Flow customNodeTypes={customNodeTypes} /> : <Spin />}</>;
};

export default RubixFlow;
