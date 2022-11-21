import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  NodeTypes,
  OnConnectStartParams,
  useEdgesState,
  useNodesState,
  XYPosition,
} from "react-flow-renderer/nocss";
import useUndoable from "use-undoable";
import cx from "classnames";
import {
  Box,
  boxesIntersect,
  useSelectionContainer,
} from "@air/react-drag-to-select";

import MiniMap from "./components/MiniMap";
import BehaveControls from "./components/Controls";
import NodePicker from "./components/NodePicker";
import NodeMenu from "./components/NodeMenu";
import { Node as NodePanel } from "./components/Node";
import { calculateNewEdge } from "./util/calculateNewEdge";
import { getNodePickerFilters } from "./util/getPickerFilters";
import { CustomEdge } from "./components/CustomEdge";
import { generateUuid } from "./lib/generateUuid";
import { ReactFlowInstance, ReactFlowProvider } from "react-flow-renderer";
import { convertDataSpec, getNodeSpecDetail, useNodesSpec } from "./use-nodes-spec";
import { Spin } from "antd";
import { NodeSpecJSON } from "./lib";
import { FlowFactory } from "./factory";
import { behaveToFlow } from "./transformers/behaveToFlow";
import ControlUndoable from "./components/ControlUndoable";
import { NodeInterface } from "./lib/Nodes/NodeInterface";
import {
  handleGetSettingType,
  handleNodesEmptySettings,
} from "./util/handleSettings";
import { useParams } from "react-router-dom";
import {
  getFlowSettings,
  FLOW_SETTINGS,
  FlowSettings,
} from "./components/FlowSettingsModal";
import { NodeSideBar } from "./components/NodeSidebar";
import "./rubix-flow.css";
import { categoryColorMap } from "./util/colors";
import { NodeCategory } from "./lib/Nodes/NodeCategory";
import { useOnPressKey } from "./hooks/useOnPressKey";
import { handleCopyNodesAndEdges } from "./util/handleNodesAndEdges";
import { isValidConnection } from "./util/isCanConnection";

const edgeTypes = {
  default: CustomEdge,
};

type SelectableBoxType = {
  edgeId: string,
  rect: DOMRect | null,
}

const Flow = (props: any) => {
  const { customNodeTypes } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([] as NodeInterface[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [shouldUpdateMiniMap, setShouldUpdateMiniMap] = useState(false);
  const [selectedNode, setSelectedNode] = useState({} as any);
  const [nodePickerVisibility, setNodePickerVisibility] =
    useState<XYPosition>();
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>();
  const [lastConnectStart, setLastConnectStart] =
    useState<OnConnectStartParams>();
  const refreshInterval = useRef<null | number>(null);
  const [undoable, setUndoable, { past, undo, canUndo, redo, canRedo }] =
    useUndoable({ nodes: nodes, edges: edges });
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [flowSettings, setFlowSettings] = useState(getFlowSettings());
  const rubixFlowWrapper = useRef<null | any>(null);
  const [rubixFlowInstance, setRubixFlowInstance] = useState<
    ReactFlowInstance | any
  >(null);
  const selectableBoxes = useRef<SelectableBoxType[]>([]);

  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const [nodesSpec] = useNodesSpec();

  const factory = new FlowFactory();

  const { DragSelection } = useSelectionContainer({
    onSelectionChange: (box: Box) => {
      if (lastConnectStart) return;
      const selectedEdgeIds: string[] = [];
      selectableBoxes.current.forEach((item: SelectableBoxType) => {
        if (item.rect && boxesIntersect(box, item.rect)) {
          selectedEdgeIds.push(item.edgeId);
        }
      });
      handleSelectEdges(selectedEdgeIds);
    },
    onSelectionStart: () => {
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
    onSelectionEnd: () => (selectableBoxes.current = []),
  });

  // delete selected wires
  useOnPressKey("Backspace", () => {
    const newEdges = edges.filter((item) => !item.selected);
    setEdges(newEdges);
    setUndoable({
      nodes,
      edges: newEdges,
    });
  });

  const onMove = () => setShouldUpdateMiniMap((s) => !s);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === null) return;
      if (connection.target === null) return;

      const newEdge = {
        id: generateUuid(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      onEdgesChange([
        {
          type: "add",
          item: newEdge,
        },
      ]);
    },
    [onEdgesChange]
  );

  const handleAddNode = useCallback(
    async (
      isParent: boolean,
      style: any,
      nodeType: string,
      position: XYPosition
    ) => {
      closeNodePicker();
      const nodeSettings = await handleGetSettingType(
        connUUID,
        hostUUID,
        isRemote,
        nodeType
      );
      const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, nodeType);
      const newNode = {
        id: generateUuid(),
        isParent,
        style,
        type: nodeType,
        position,
        data: {
          inputs: convertDataSpec(spec.inputs || []),
          out: convertDataSpec(spec.outputs || []),
        },
        settings: nodeSettings,
      };
      onNodesChange([
        {
          type: "add",
          item: newNode,
        },
      ]);

      if (lastConnectStart === undefined) return;

      // add an edge if we started on a socket
      const originNode = nodes.find(
        (node) => node.id === lastConnectStart.nodeId
      );
      if (originNode === undefined) return;
      onEdgesChange([
        {
          type: "add",
          item: calculateNewEdge(
            originNode,
            nodeType,
            newNode.id,
            lastConnectStart
          ),
        },
      ]);
    },
    [lastConnectStart, nodes, onEdgesChange, onNodesChange]
  );

  const handleStartConnect = (
    e: ReactMouseEvent,
    params: OnConnectStartParams
  ) => {
    setLastConnectStart(params);
  };

  const onEdgeContextMenu = useCallback(
    (evt: ReactMouseEvent, edge: any) => {
      evt.preventDefault();
      const newEdges = edges.map((item) =>
        item.id === edge.id ? { ...edge, selected: !item.selected } : item
      );
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const onConnectEnd = (evt: ReactMouseEvent | any) => {
    const {
      nodeid: nodeId,
      handleid: handleId,
      handlepos: position,
    } = (evt.target as HTMLDivElement).dataset;
    const isTarget = position === "left";

    if (lastConnectStart) {
      const isDragSelected = edges.some((item) => {
        const isChangeTarget =
          lastConnectStart.handleType === "target" &&
          item.targetHandle === lastConnectStart.handleId;
        const isChangeSource =
          lastConnectStart.handleId === "out" &&
          item.source === lastConnectStart.nodeId;

        return item.selected && (isChangeTarget || isChangeSource);
      });

      const lastHandleId = lastConnectStart.handleId;
      const isTrueHandleId =
        handleId &&
        lastHandleId &&
        ((handleId.indexOf("in") > -1 && lastHandleId.indexOf("in") > -1) ||
          (handleId.indexOf("out") > -1 && lastHandleId.indexOf("out") > -1));

      if (isDragSelected && isTrueHandleId) {
        let newEdges;
        if (nodeId) {
          // update selected lines to new node if start and end are same type
          newEdges = edges.map((item) => {
            if (
              item.selected &&
              lastConnectStart.nodeId === item[lastConnectStart.handleType!!]
            ) {
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
          const newEdge = {
            id: generateUuid(),
            source: isSource ? conNodeId : nodeId,
            sourceHandle: isSource ? conHandleId : handleId,
            target: !isSource ? conNodeId : nodeId,
            targetHandle: !isSource ? conHandleId : handleId,
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

  const handlePaneClick = () => closeNodePicker();

  const handlePaneContextMenu = (event: ReactMouseEvent) => {
    const { x, y } = setMousePosition(event);
    setNodePickerVisibility({ x, y });
  };

  const handleNodeContextMenu = (
    event: React.MouseEvent,
    node: NodeInterface
  ) => {
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
      if (item.id === node.id) {
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

  const handleDeleteEdges = (_nodes: any, _edges: any) => {
    setUndoable({
      nodes: _nodes,
      edges: _edges,
    });
  };

  const handleCopyNodes = async (_copied: {
    nodes: NodeInterface[];
    edges: any;
  }) => {
    /* Unselected nodes, edges */
    nodes.forEach((item) => (item.selected = false));
    edges.forEach((item) => (item.selected = false));

    /*
    * Generate new id of edges copied
    * Add new id source and target of edges copied
    */
    const newFlow = handleCopyNodesAndEdges(_copied);

    newFlow.nodes = await handleNodesEmptySettings(
      connUUID,
      hostUUID,
      isRemote,
      newFlow.nodes
    );

    const _nodes = [...nodes, ...newFlow.nodes];
    const _edges = [...edges, ...newFlow.edges];
    setNodes(_nodes);
    setEdges(_edges);
    setUndoable({ edges: _edges, nodes: _nodes });
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
    const { isParent, nodeType } = JSON.parse(
      event.dataTransfer.getData("from-node-sidebar")
    );
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
    const newEdges = edges.map((item) =>
      edgeIds.includes(item.id) ? { ...item, selected: true } : item
    );
    setEdges(newEdges);
  };

  useEffect(() => {
    closeNodePicker();
    factory
      .GetFlow(connUUID, hostUUID, isRemote)
      .then(async (res) => {
        const [_nodes, _edges] = behaveToFlow(res);
        const newNodes = await handleNodesEmptySettings(
          connUUID,
          hostUUID,
          isRemote,
          _nodes
        );

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
    if (
      past &&
      past.length !== 0 &&
      undoable.nodes &&
      undoable.nodes.length > 0
    ) {
      setNodes(undoable.nodes);
      setEdges(undoable.edges);
    }
  }, [undoable]);

  useEffect(() => {
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
  }, [nodes]);

  useEffect(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);

    refreshInterval.current = setInterval(
      handleRefreshValues,
      flowSettings.refreshTimeout * 1000
    );

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [flowSettings.refreshTimeout]);

  return (
    <div className="rubix-flow">
      <ReactFlowProvider>
        <NodeSideBar />
        <div className="rubix-flow__wrapper" ref={rubixFlowWrapper}>
          <ReactFlow
            nodeTypes={customNodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onMove={onMove}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={onEdgeClick}
            onConnect={onConnect}
            onConnectStart={handleStartConnect}
            onEdgeContextMenu={onEdgeContextMenu}
            // onConnectStop={handleStopConnect}
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
                nodes={nodes}
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
            <Background
              variant={BackgroundVariant.Lines}
              color="#353639"
              style={{ backgroundColor: "#1E1F22" }}
            />
            <BehaveControls
              onDeleteEdges={handleDeleteEdges}
              onCopyNodes={handleCopyNodes}
              onUndo={undo}
              onRedo={handleRedo}
              onRefreshValues={handleRefreshValues}
              settings={flowSettings}
              onSaveSettings={onSaveFlowSettings}
            />
            {nodePickerVisibility && (
              <NodePicker
                position={nodePickerVisibility}
                filters={getNodePickerFilters(nodes, lastConnectStart)}
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

  const customNodeTypes = (nodesSpec as NodeSpecJSON[]).reduce(
    (nodes, node) => {
      nodes[node.type] = (props: any) => <NodePanel {...props} spec={node} />;
      return nodes;
    },
    {} as NodeTypes
  );

  return (
    <>
      {isFetchingNodeSpec ? (
        <Flow customNodeTypes={customNodeTypes} />
      ) : (
        <Spin />
      )}
    </>
  );
};

export default RubixFlow;
