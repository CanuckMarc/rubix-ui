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
import { isInputFlow, isOutputFlow, Node as NodePanel } from "./components/Node";
import { calculateNewEdge } from "./util/calculateNewEdge";
import { getNodePickerFilters } from "./util/getPickerFilters";
import { CustomEdge } from "./components/CustomEdge";
import { generateUuid } from "./lib/generateUuid";
import { Edge, EdgeProps, ReactFlowInstance, ReactFlowProvider } from "react-flow-renderer";
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
import { NodesTree } from "./components/NodesTree";
import { NodeSideBar } from "./components/NodeSidebar";
import "./rubix-flow.css";
import { categoryColorMap } from "./util/colors";
import { NodeCategory } from "./lib/Nodes/NodeCategory";
import { useOnPressKey } from "./hooks/useOnPressKey";
import { handleCopyNodesAndEdges } from "./util/handleNodesAndEdges";
import { isValidConnection, isInputExistConnection } from "./util/isCanConnection";
import { flowToBehave } from "./transformers/flowToBehave";
import { uniqArray } from "../../utils/utils";
import { SPLIT_KEY } from "./hooks/useChangeNodeData";
import { ConnectionBuilderModal } from "./components/ConnectionBuilderModal";
import { LoadWiresMap } from "./components/LoadWiresMap";
import { useIsLoading } from "../../App";

type SelectableBoxType = {
  edgeId: string;
  rect: DOMRect | null;
};

type NodeInterfaceWithOldId = NodeInterface & { oldId?: string };

// this is save all nodes
declare global {
  interface Window {
    subFlowIds: string[];
    selectedNodeForSubFlow: NodeInterface | undefined;
    allFlow: { nodes: NodeInterface[]; edges: Edge[] }; // save all nodes and edges
  }
}

type FlowProps = {
  customEdgeTypes: any;
  customNodeTypes: any;
  selectedNodeForSubFlow: NodeInterface | undefined;
  setSelectedNodeForSubFlow: (node: NodeInterface[]) => void;
  handlePushSelectedNodeForSubFlow: (node: NodeInterface) => void;
  handleRemoveSelectedNodeForSubFlow: () => void;
};

const Flow = (props: FlowProps) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const {
    customNodeTypes,
    customEdgeTypes,
    selectedNodeForSubFlow,
    setSelectedNodeForSubFlow,
    handlePushSelectedNodeForSubFlow,
    handleRemoveSelectedNodeForSubFlow,
  } = props;
  // const [allFlow, setAllFlow] = useState<{ nodes: NodeInterface[]; edges: Edge[] }>({
  //   nodes: [],
  //   edges: [],
  // });
  const [nodes, setNodes, onNodesChange] = useNodesState([] as NodeInterface[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [shouldUpdateMiniMap, setShouldUpdateMiniMap] = useState(false);
  const [selectedNode, setSelectedNode] = useState({} as any);
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>();
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>();
  const [isMenuOpenFromNodeTree, setMenuOpenFromNodeTree] = useState(false);
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>();
  const [undoable, setUndoable, { past, undo, canUndo, redo, canRedo }] = useUndoable({ nodes: nodes, edges: edges });
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [flowSettings, setFlowSettings] = useState(getFlowSettings());
  const [rubixFlowInstance, setRubixFlowInstance] = useState<ReactFlowInstance | any>(null);
  const [nodesSpec] = useNodesSpec();
  const refreshInterval = useRef<null | any>(null);
  const rubixFlowWrapper = useRef<null | any>(null);
  const selectableBoxes = useRef<SelectableBoxType[]>([]);
  const isDragSelection = useRef<boolean>(false);
  const changeSelectionRef = useRef<number | null>(null);
  const [isConnectionBuilder, setIsConnectionBuilder] = useState(false);

  const isRemote = !!connUUID && !!hostUUID;
  const factory = new FlowFactory();

  const [refreshCounter, incrementRefreshCounter] = useIsLoading(
    (state) => [state.refreshCounter, state.incrementRefreshCounter]
  )

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
      deleteNodesAndEdges([], edgesDeleted);
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
        isParent,
        style,
        type: nodeType,
        position,
        data: {
          inputs: convertDataSpec(spec.inputs || []),
          out: convertDataSpec(spec.outputs || []),
        },
        parentId: selectedNodeForSubFlow?.id || undefined,
        settings: nodeSettings,
        selected: false,
      };

      onNodesChange([{ type: "add", item: newNode }]);
      window.allFlow.nodes = [...window.allFlow.nodes, newNode];
      setTimeout(() => {
        setNodes((newNodes) => newNodes.map((item) => ({ ...item, selected: false })));
      }, 100);

      if (lastConnectStart === undefined) return;

      // add an edge if we started on a socket
      const originNode = nodes.find((node) => node.id === lastConnectStart.nodeId);
      if (originNode === undefined) return;

      const newEdge = calculateNewEdge(originNode, nodeType, newNode.id, lastConnectStart);

      if (newEdge.targetHandle && isInputExistConnection(edges, newEdge.target, newEdge.targetHandle)) {
        return;
      }

      onEdgesChange([{ type: "add", item: newEdge }]);
      window.allFlow.edges = [...window.allFlow.edges, newEdge];
    },
    [lastConnectStart, nodes, onEdgesChange, onNodesChange, selectedNodeForSubFlow]
  );

  const handleAddSubFlow = (node: NodeInterface) => {
    handlePushSelectedNodeForSubFlow(node);
  };

  const handleConnectionBuilderFlow = (node: NodeInterface) => {
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
    setEdges((edges) => edges.map((e) => ({ ...e, selected: false })));
    if (node.id !== selectedNodeForSubFlow?.id) {
      handlePushSelectedNodeForSubFlow(node);
    }
    setIsConnectionBuilder(true);
  };

  const handleLoadNodesAndEdges = (newNodes: NodeInterface[], newEdges: Edge[]) => {
    console.log("LOADING NODES AND EDGES", { nodes: newNodes, edges: newEdges });

    const currentNodes = nodes.map((item) => ({ ...item, selected: false }));
    const currentEdges = edges.map((item) => ({ ...item, selected: false }));

    // filter parent nodes and nodes not belonging to sub flow
    // generate nodes with new id and keep old id to mapping with edge
    const newNodesWithOldId: NodeInterfaceWithOldId[] = [];
    const nodesL1 = newNodes
      .filter((node: NodeInterface) => {
        return !newNodes.some((node2: NodeInterface) => node2.id === node.parentId);
      })
      .map((node: NodeInterface) => ({
        ...node,
        parentId: selectedNodeForSubFlow?.id || undefined,
      }));

    // nodes not included in nodesL1
    const nodesRemaining = newNodes.filter(
      (node: NodeInterface) => !nodesL1.some((node2: NodeInterface) => node2.id === node.id)
    );

    const copyAllNode = (id: string, newId: string) => {
      const childNodes = newNodes.filter((node: NodeInterface) => id === node.parentId);

      childNodes.forEach((childItem: NodeInterface) => {
        const childNodeId = generateUuid();
        newNodesWithOldId.push({ ...childItem, oldId: childItem.id, id: childNodeId, parentId: newId });

        if (childItem.isParent) {
          copyAllNode(childItem.id, childNodeId);
        }
      });
    };

    nodesL1.forEach((item: NodeInterface) => {
      const newNodeId = generateUuid();
      newNodesWithOldId.push({ ...item, oldId: item.id, id: newNodeId });

      if (item.isParent) {
        copyAllNode(item.id, newNodeId);
      }
    });

    nodesRemaining.forEach((item: NodeInterface) => {
      const isExist = newNodesWithOldId.some((node: NodeInterfaceWithOldId) => node.oldId === item.id);
      if (!isExist) {
        newNodesWithOldId.push({ ...item, oldId: item.id, id: generateUuid() });
      }
    });

    const finalEdges = newEdges.map((edge: Edge) => {
      const target = newNodesWithOldId.find((n: any) => n.oldId === edge.target);
      const source = newNodesWithOldId.find((n: any) => n.oldId === edge.source);
      return {
        ...edge,
        id: generateUuid(),
        target: target?.id || edge.target,
        source: source?.id || edge.source,
      };
    });

    setNodes([...currentNodes, ...newNodesWithOldId]);
    setEdges([...currentEdges, ...finalEdges]);
    window.allFlow = {
      nodes: [...window.allFlow.nodes, ...newNodesWithOldId],
      edges: [...window.allFlow.edges, ...finalEdges],
    };

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      rubixFlowInstance.fitView();
    }, 100);
  };

  const onCloseBuilderModal = () => {
    setIsConnectionBuilder(false);
  };

  const onClearAllNodes = () => {
    if (selectedNodeForSubFlow) {
      const nodeIdsCleared = nodes
        .filter((node: NodeInterface) => node.parentId === selectedNodeForSubFlow.id)
        .map((item) => item.id);
      const edgeIdsCleared = edges
        .filter((edge: Edge) => nodeIdsCleared.includes(edge.target) || nodeIdsCleared.includes(edge.source))
        .map((item) => item.id);
      const remainingNodes = nodes.filter((item) => !nodeIdsCleared.includes(item.id));
      const remainingEdges = edges.filter((item: Edge) => !edgeIdsCleared.includes(item.id));
      setNodes(remainingNodes);
      setEdges(remainingEdges);
      window.allFlow = {
        nodes: window.allFlow.nodes.filter((n) => !nodeIdsCleared.includes(n.id)),
        edges: window.allFlow.edges.filter((n) => !edgeIdsCleared.includes(n.id)),
      };
    } else {
      setNodes([]);
      setEdges([]);
      window.allFlow = {
        nodes: [],
        edges: [],
      };
    }
  };

  // exit each subflow
  const onCloseSubFlow = () => {
    handleRemoveSelectedNodeForSubFlow();
    setIsConnectionBuilder(false);
  };

  // close sub flow
  const onBackToMain = () => {
    setSelectedNodeForSubFlow([]);
    setIsConnectionBuilder(false);
  };

  const onHandelSaveFlow = async () => {
    const allNodes = [...nodes];
    window.allFlow.nodes.forEach((node) => {
      const isExist = allNodes.some((n) => n.id === node.id);
      if (!isExist) {
        allNodes.push(node);
      }
    });

    const newNodesFiltered = allNodes.filter((node: NodeInterface) => {
      if (node.parentId) {
        return allNodes.some((n) => n.id === node.parentId);
      }
      return true;
    });
    const graphJson = flowToBehave(newNodesFiltered, window.allFlow.edges);

    // save nodes and edges
    await factory.DownloadFlow(connUUID, hostUUID, isRemote, graphJson, true);

    // format nodes with settings
    const nodesWithSetting = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, newNodesFiltered);

    // filter nodes at level 1 or in sub flow
    const newNodesL1 = nodesWithSetting.filter((node) => {
      return selectedNodeForSubFlow ? selectedNodeForSubFlow.id === node.parentId : !node.parentId;
    });

    nodesWithSetting.forEach((node1) => {
      const hasParent = newNodesL1.some((node2) => {
        return node2.id === node1.parentId && (isInputFlow(node1.type!!) || isOutputFlow(node1.type!!));
      });
      if (hasParent) {
        newNodesL1.push(node1);
      }
    });
    const edgesL1 = window.allFlow.edges.filter((e) =>
      newNodesL1.some((node) => node.id === e.target || node.id === e.source)
    );

    setNodes(newNodesL1.map((n) => ({ ...n, selected: false })));
    setEdges(edgesL1.map((n) => ({ ...n, selected: false })));
    window.allFlow = { nodes: nodesWithSetting, edges: window.allFlow.edges };
    handleRefreshValues();
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
    if (lastConnectStart) {
      const { nodeid: nodeId, handleid: handleId, handlepos: position } = (evt.target as HTMLDivElement).dataset;
      const isTarget = position === "left";

      const [targetHandleId, targetNodeId] = handleId?.includes(SPLIT_KEY)
        ? handleId.split(SPLIT_KEY)
        : [handleId, nodeId];

      const [lastConnectStartHandleId, lastConnectStartNodeId] = lastConnectStart.handleId?.includes(SPLIT_KEY)
        ? lastConnectStart.handleId.split(SPLIT_KEY)
        : [lastConnectStart.handleId, lastConnectStart.nodeId];

      if (
        targetNodeId &&
        targetHandleId &&
        !isValidConnection(nodes, lastConnectStart, { nodeId: targetNodeId, handleId: targetHandleId }, isTarget)
      ) {
        return;
      }

      const edgeByTarget: Edge | undefined = edges.find((e) =>
        isTarget ? e.target === targetNodeId && e.targetHandle === targetHandleId : e.target === lastConnectStartNodeId
      );

      const isSameTarget = lastConnectStart.handleType === "target" && isTarget;

      if (edgeByTarget && !isSameTarget) {
        const newSourceId = isTarget ? lastConnectStartNodeId!! : targetNodeId!!;
        const newSourceHandle = isTarget ? lastConnectStartHandleId!! : targetHandleId!!;

        if (newSourceId !== edgeByTarget.target) {
          edgeByTarget.source = newSourceId;
          edgeByTarget.sourceHandle = newSourceHandle;

          const newEdges = edges.map((item) => (item.id === edgeByTarget.id ? edgeByTarget : item));
          setEdges(newEdges);
          window.allFlow.edges = window.allFlow.edges.map((e) => newEdges.find((e2) => e2.id === e.id) || e);
          setUndoable({
            edges: newEdges,
            nodes,
          });
        }
        return;
      }

      const isDragSelected = edges.some((item) => {
        if (item.selected) {
          const isChangeTarget =
            lastConnectStart.handleType === "target" && item.targetHandle === lastConnectStartHandleId;
          const isChangeSource = lastConnectStartHandleId && item.source === lastConnectStartNodeId;

          return isChangeTarget || isChangeSource;
        }

        return false;
      });

      if (isDragSelected) {
        let newEdges: Edge[] = [];
        if (targetNodeId) {
          // update selected lines to new node if start and end are same type
          newEdges = edges.map((item: Edge) => {
            if (item.selected && lastConnectStartNodeId === item[lastConnectStart.handleType!!]) {
              const updateKey = isTarget ? "target" : "source";
              item[`${updateKey}Handle`] = targetHandleId;
              item[updateKey as keyof Edge] = targetNodeId;
            }
            return item;
          });
          // remove edges have same target
          newEdges = newEdges.filter(
            (edge, index) => index === newEdges.findIndex((edge2) => edge2.target === edge.target)
          );
        } else {
          // remove selected lines
          newEdges = edges.filter((item) => !item.selected);
        }

        if (newEdges) {
          setEdges(newEdges);
          window.allFlow.edges = window.allFlow.edges.map((e) => newEdges.find((e2) => e2.id === e.id) || e);
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
        if (!isSameTarget && targetNodeId && lastConnectStartNodeId) {
          const newEdge = {
            id: generateUuid(),
            source: lastConnectStartNodeId,
            sourceHandle: lastConnectStartHandleId,
            target: targetNodeId,
            targetHandle: targetHandleId,
          };

          onEdgesChange([{ type: "add", item: newEdge }]);
          window.allFlow.edges = [...window.allFlow.edges, newEdge];
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
    setNodes(nodes.map((node) => ({ ...node, selected: false })));
    setEdges(edges.map((ed) => ({ ...ed, selected: false })));
    closeNodePicker();
  };

  const onChangeSelection = ({
    nodes: newNodesChange,
    edges: newEdgesChange,
  }: {
    nodes: NodeInterface[];
    edges: Edge[];
  }) => {
    if (changeSelectionRef.current) {
      clearTimeout(changeSelectionRef.current);
      changeSelectionRef.current = null;
    }

    if (newNodesChange.length > 0 || newEdgesChange.length > 0) {
      changeSelectionRef.current = setTimeout(() => {
        const newNodes = nodes.map((node) => {
          node.selected = newNodesChange.some((i) => i.id === node.id);
          return node;
        });
        const newEdges = edges.map((edge) => {
          edge.selected = newEdgesChange.some((i) => i.id === edge.id);
          return edge;
        });

        setNodes(newNodes);
        setEdges(newEdges);
      }, 50);
    }
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

  const getChildNodeIds = (parentId: string) => {
    const childNodes: NodeInterface[] = nodes.filter((node: NodeInterface) => node.parentId === parentId);
    const nodeIds: string[] = [];

    for (const node of childNodes) {
      nodeIds.push(node.id);
      if (node.isParent) {
        nodeIds.push(...getChildNodeIds(node.id));
      }
    }
    return nodeIds;
  };

  const deleteNodesAndEdges = (_nodesDeleted: NodeInterface[], _edgesDeleted: Edge[]) => {
    const nodeIds: string[] = [];

    for (const node of _nodesDeleted) {
      nodeIds.push(node.id);
      if (node.isParent) {
        nodeIds.push(...getChildNodeIds(node.id));
      }
    }

    const remainingNodes = nodes.filter((item) => !nodeIds.includes(item.id));
    const remainingEdges = edges.filter(
      (item) =>
        !_edgesDeleted.some((item2) => item.id === item2.id) &&
        !nodeIds.includes(item.target) &&
        !nodeIds.includes(item.source)
    );

    const allRemainingNodes = window.allFlow.nodes.filter((n) => !nodeIds.includes(n.id));
    window.allFlow = {
      nodes: allRemainingNodes,
      edges: window.allFlow.edges.filter(
        (item) =>
          !_edgesDeleted.some((item2) => item.id === item2.id) &&
          !nodeIds.includes(item.target) &&
          !nodeIds.includes(item.source)
      ),
    };
    setNodes(remainingNodes);
    setEdges(remainingEdges);
    setUndoable({
      nodes: remainingNodes,
      edges: remainingEdges,
    });
  };

  const handleCopyNodes = async (_copied: { nodes: NodeInterface[]; edges: any }) => {
    /* Unselected nodes, edges */
    nodes.forEach((item) => (item.selected = false));
    edges.forEach((item) => (item.selected = false));

    /*
     * Generate new id of edges copied
     * Add new id source and target of edges copied
     */
    const newFlow = handleCopyNodesAndEdges(_copied, window.allFlow.nodes, window.allFlow.edges);

    newFlow.nodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, newFlow.nodes);

    // remove output connection if node at level 1
    // get nodes level 1
    const nodesL1: NodeInterface[] = _copied.nodes.filter((node: NodeInterface) => {
      return !node.parentId || !_copied.nodes.some((node2) => node.parentId === node2.id);
    });
    // get nodes level 1 corresponding with new id
    const newNodeL1: NodeInterface[] = newFlow.nodes.filter((node: NodeInterface) =>
      nodesL1.some((node2: NodeInterface) => node2.id === node.oldId)
    );

    // save all node have output connection
    // if node is parent then get connection of outputs
    const allNodes: NodeInterface[] = [];
    newNodeL1.forEach((node) => {
      if (node.isParent) {
        const outputs = newFlow.nodes
          .filter((node2: NodeInterface) => node2.parentId === node.id)
          .filter((n) => isOutputFlow(n.type!!));
        allNodes.push(...outputs);
      } else {
        allNodes.push(node);
      }
    });

    // remove connections have source id is belong allNodes
    newFlow.edges = newFlow.edges.filter(
      (edge: Edge) => !allNodes.some((node: NodeInterface) => node.id === edge.source)
    );

    // unique items and delete oldId field
    const nodesUniq = uniqArray([...nodes, ...newFlow.nodes]).map(({ oldId, ...node }: NodeInterface) => node);
    const edgesUniq = uniqArray([...edges, ...newFlow.edges]).map(({ oldId, ...edge }: any) => edge);
    const newAllNodes = [...window.allFlow.nodes];
    const newAllEdges = [...window.allFlow.edges];

    nodesUniq.forEach((n: NodeInterface) => {
      const exist = newAllNodes.some((node: NodeInterface) => node.id === n.id);
      if (!exist) {
        newAllNodes.push(n);
      }
    });
    edgesUniq.forEach((n: Edge) => {
      const exist = newAllEdges.some((node: Edge) => node.id === n.id);
      if (!exist) {
        newAllEdges.push(n);
      }
    });

    window.allFlow = { nodes: newAllNodes, edges: newAllEdges };
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

  const deleteAllInputOrOutputOfParentNode = (isInputs: boolean, parentNodeId: string) => {
    const deletedNodes: NodeInterface[] = nodes
      .filter((node: NodeInterface) => node.parentId === parentNodeId)
      .filter(({ type }: NodeInterface) => {
        if (isInputs) {
          return isInputFlow(type!!);
        }
        return isOutputFlow(type!!);
      });

    if (deletedNodes.length > 0) {
      deleteNodesAndEdges(deletedNodes, []);
    }
  };

  const openNodeMenu = (position: { x: number; y: number }, node: NodeInterface) => {
    setNodeMenuVisibility(position);
    setSelectedNode(node);
    setMenuOpenFromNodeTree(true);
  };

  const deleteAllInputOrOutputConnectionsOfNode = (isInputs: boolean, nodeId: string) => {
    const node: NodeInterface | undefined = nodes.find((n: NodeInterface) => n.id === nodeId);

    if (node) {
      let deletedEdges: Edge[] = [];
      if (node.isParent) {
        const nodesWithConnections: NodeInterface[] = nodes
          .filter((node: NodeInterface) => node.parentId === nodeId)
          .filter(({ type }: NodeInterface) => {
            return isInputs ? isInputFlow(type!!) : isOutputFlow(type!!);
          });

        deletedEdges = edges.filter((edge: Edge) => {
          return nodesWithConnections.some((node: NodeInterface) => {
            return isInputs ? node.id === edge.target : node.id === edge.source;
          });
        });
      } else {
        deletedEdges = edges.filter((edge: Edge) => {
          return isInputs ? nodeId === edge.target : nodeId === edge.source;
        });
      }
      if (deletedEdges.length > 0) {
        deleteNodesAndEdges([], deletedEdges);
      }
    }
  };

  const gotoNode = (node: NodeInterface) => {
    if (node.parentId) {
      node.isParent
        ? handleAddSubFlow(node)
        : handleAddSubFlow(window.allFlow.nodes.filter((item: NodeInterface) => item.id === node.parentId)[0]);
    } else {
      setSelectedNodeForSubFlow([]);
    }
    setTimeout(() => {
      setNodes((newNodes) => newNodes.map((item: NodeInterface) => ({ ...item, selected: item.id === node.id })));
    }, 1000);
    rubixFlowInstance.fitView(node.position);
  };

  useEffect(() => {
    if (!window.allFlow) {
      window.allFlow = { nodes: [], edges: [] };
    }

    // save all nodes with latest values
    window.allFlow.nodes = window.allFlow.nodes.map((node) => {
      return nodes.find((node2: NodeInterface) => node2.id === node.id) || node;
    });

    // get nodes and edges by sub flow or level 1 from all nodes and edges saved
    // when change sub flow
    const newNodes = window.allFlow.nodes.filter((node) => {
      return selectedNodeForSubFlow ? selectedNodeForSubFlow.id === node.parentId : !node.parentId;
    });

    window.allFlow.nodes.forEach((node1) => {
      const hasParent = newNodes.some((node2) => {
        return node2.id === node1.parentId && (isInputFlow(node1.type!!) || isOutputFlow(node1.type!!));
      });
      if (hasParent) {
        newNodes.push(node1);
      }
    });
    const edgesL1 = window.allFlow.edges.filter((e) =>
      newNodes.some((node) => node.id === e.target || node.id === e.source)
    );

    setNodes(newNodes.map((n) => ({ ...n, selected: false })));
    setEdges(edgesL1.map((n) => ({ ...n, selected: false })));
    handleRefreshValues();
    setTimeout(() => {
      rubixFlowInstance?.fitView();
    }, 30);
  }, [selectedNodeForSubFlow, setNodes, setEdges]);

  useEffect(() => {
    closeNodePicker();
    factory
      .GetFlow(connUUID, hostUUID, isRemote)
      .then(async (res) => {
        let [_nodes, _edges] = behaveToFlow(res);
        _nodes = handleInputEmpty(res.nodes || [], _nodes, nodesSpec as NodeSpecJSON[]);

        const newNodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, _nodes);
        // just show nodes and edges at level 1
        const nodesL1 = newNodes.filter((node) => !node.parentId);

        newNodes.forEach((node1) => {
          const hasParent = nodesL1.some(
            (node2) =>
              !!node1.parentId &&
              node2.id === node1.parentId &&
              (isInputFlow(node1.type!!) || isOutputFlow(node1.type!!))
          );
          if (hasParent) {
            nodesL1.push(node1);
          }
        });
        const edgesL1 = _edges.filter((e) => nodesL1.some((node) => node.id === e.target || node.id === e.source));

        // tracking all nodes and edges to save
        window.allFlow = { nodes: newNodes, edges: _edges };
        setNodes(nodesL1);
        setEdges(edgesL1);
        setUndoable({ nodes: nodesL1, edges: edgesL1 });
        /* Get output Nodes */
        handleRefreshValues();
        incrementRefreshCounter();
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
    if (refreshInterval.current) clearInterval(refreshInterval.current);

    refreshInterval.current = setInterval(handleRefreshValues, flowSettings.refreshTimeout * 1000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [flowSettings.refreshTimeout]);

  return (
    <div className="rubix-flow">
      {flowSettings.showNodesTree && (
        <NodesTree
          nodes={window.allFlow?.nodes || []}
          selectedSubFlowId={selectedNodeForSubFlow?.id}
          openNodeMenu={openNodeMenu}
          nodesSpec={nodesSpec}
          gotoNode={gotoNode}
        />
      )}
      {flowSettings.showNodesPallet && <NodeSideBar nodesSpec={nodesSpec} />}
      <div className="rubix-flow__wrapper" ref={rubixFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            onContextMenu={() => setMenuOpenFromNodeTree(false)}
            nodeTypes={customNodeTypes}
            edgeTypes={customEdgeTypes}
            nodes={nodes}
            edges={edges}
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
            <LoadWiresMap />
            <DragSelection />
            {flowSettings.showMiniMap && (
              <MiniMap
                nodes={nodes.filter((node: NodeInterface) => {
                  if (selectedNodeForSubFlow) {
                    return node.parentId === selectedNodeForSubFlow.id;
                  }
                  return !node.parentId;
                })}
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
              deleteNodesAndEdges={deleteNodesAndEdges}
              onCopyNodes={handleCopyNodes}
              onUndo={undo}
              onRedo={handleRedo}
              onRefreshValues={handleRefreshValues}
              settings={flowSettings}
              onSaveSettings={onSaveFlowSettings}
              selectedNodeForSubFlow={selectedNodeForSubFlow}
              onClearAllNodes={onClearAllNodes}
              onCloseSubFlow={onCloseSubFlow}
              onBackToMain={onBackToMain}
              onHandelSaveFlow={onHandelSaveFlow}
              isConnectionBuilder={isConnectionBuilder}
              handleConnectionBuilderFlow={handleConnectionBuilderFlow}
              handleLoadNodesAndEdges={handleLoadNodesAndEdges}
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
                isOpenFromNodeTree={isMenuOpenFromNodeTree}
                deleteAllInputOrOutputOfParentNode={deleteAllInputOrOutputOfParentNode}
                deleteAllInputOrOutputConnectionsOfNode={deleteAllInputOrOutputConnectionsOfNode}
                deleteNode={deleteNodesAndEdges}
                duplicateNode={handleCopyNodes}
                position={nodeMenuVisibility}
                node={selectedNode}
                nodesSpec={nodesSpec}
                onClose={closeNodePicker}
                isDoubleClick={isDoubleClick}
                handleAddSubFlow={handleAddSubFlow}
                selectedNodeForSubFlow={selectedNodeForSubFlow}
              />
            )}
            {!!selectedNodeForSubFlow && (
              <ConnectionBuilderModal
                parentNode={selectedNodeForSubFlow}
                open={isConnectionBuilder}
                onClose={onCloseBuilderModal}
                nodesSpec={nodesSpec}
              />
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export const RubixFlow = () => {
  const [nodesSpec, setNodesSpec, isFetchingNodeSpec] = useNodesSpec();
  const [selectedNodeForSubFlow, setSelectedNodeForSubFlow] = useState<NodeInterface[]>([]);
  const nodeForSubFlowEnd = selectedNodeForSubFlow[selectedNodeForSubFlow.length - 1];

  useEffect(() => {
    window.subFlowIds = selectedNodeForSubFlow.map((node) => node.id);
    window.selectedNodeForSubFlow = nodeForSubFlowEnd;
  }, [selectedNodeForSubFlow, nodeForSubFlowEnd]);

  // push the node which is subflow in to save the flow of subflow
  const handlePushSelectedNodeForSubFlow = (node: NodeInterface) => {
    setSelectedNodeForSubFlow([...selectedNodeForSubFlow, node]);
  };

  // remove the last node to exit each subflow
  const handleRemoveSelectedNodeForSubFlow = () => {
    const arrNodeForSubFlow = [...selectedNodeForSubFlow];
    arrNodeForSubFlow.pop();
    setSelectedNodeForSubFlow(arrNodeForSubFlow);
  };

  const customEdgeTypes = {
    default: (props: EdgeProps) => <CustomEdge {...props} parentNodeId={nodeForSubFlowEnd?.id} />,
  };

  const customNodeTypes = (nodesSpec as NodeSpecJSON[]).reduce((nodes, node) => {
    nodes[node.type] = (props: any) => (
      <NodePanel {...props} spec={node} key={node.id} parentNodeId={nodeForSubFlowEnd?.id} nodesSpec={nodesSpec} />
    );
    return nodes;
  }, {} as NodeTypes);

  return (
    <>
      {!isFetchingNodeSpec ? (
        <Flow
          customEdgeTypes={customEdgeTypes}
          customNodeTypes={customNodeTypes}
          selectedNodeForSubFlow={nodeForSubFlowEnd}
          setSelectedNodeForSubFlow={setSelectedNodeForSubFlow}
          handlePushSelectedNodeForSubFlow={handlePushSelectedNodeForSubFlow}
          handleRemoveSelectedNodeForSubFlow={handleRemoveSelectedNodeForSubFlow}
        />
      ) : (
        <Spin />
      )}
    </>
  );
};

export default RubixFlow;
