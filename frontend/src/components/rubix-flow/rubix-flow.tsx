import { ChangeEvent, MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  NodeTypes,
  OnConnectStartParams,
  useEdgesState,
  useNodesState,
  XYPosition,
  EdgeProps,
  ReactFlowInstance,
  MiniMap,
  ReactFlowProvider,
} from "reactflow";
import cx from "classnames";
import { Box, boxesIntersect, useSelectionContainer } from "@air/react-drag-to-select";
import BehaveControls from "./components/Controls";
import NodePicker from "./components/NodePicker";
import NodeMenu from "./components/NodeMenu";
import { isInputFlow, isOutputFlow, Node as NodePanel } from "./components/Node";
import { calculateNewEdge } from "./util/calculateNewEdge";
import { getNodePickerFilters } from "./util/getPickerFilters";
import { CustomEdge } from "./components/CustomEdge";
import { generateUuid } from "./lib/generateUuid";
import { convertDataSpec, getNodeSpecDetail, useNodesSpec } from "./use-nodes-spec";
import { Spin, Tabs } from "antd";
import { UnorderedListOutlined, NodeIndexOutlined, ApartmentOutlined } from "@ant-design/icons";
import { NodeSpecJSON } from "./lib";
import { FlowFactory } from "./factory";
import { behaveToFlow } from "./transformers/behaveToFlow";
import ControlUndoable from "./components/ControlUndoable";
import { NodeInterface, EdgeInterface as Edge } from "./lib/Nodes/NodeInterface";
import { handleGetSettingType } from "./util/handleSettings";
import { useParams } from "react-router-dom";
import { getFlowSettings, FLOW_SETTINGS, FlowSettings } from "./components/FlowSettingsModal";
import { NodesTree } from "./components/NodesTree";
import { PointsPallet } from "./components/PointsPallet";
import { NodeSideBar } from "./components/NodeSidebar";
import { useOnPressKey } from "./hooks/useOnPressKey";
import { handleCopyNodesAndEdges } from "./util/handleNodesAndEdges";
import { isValidConnection, isInputExistConnection } from "./util/isCanConnection";
import { flowToBehave } from "./transformers/flowToBehave";
import { uniqArray } from "../../utils/utils";
import { ConnectionBuilderModal } from "./components/ConnectionBuilderModal";
import { LoadWiresMap } from "./components/LoadFlownetMap";
import { LoadBacnetMap } from "./components/LoadBacnetMap";
import { useIsLoading } from "../../App";
import { LinkBuilderModal } from "./components/LinkBuilderModal";
import { SubFlowTabs } from "./components/SubFlowTabs";
import SelectMenu from "./components/SelectMenu";
import { formatParentNodesWithInputsOutputs, formatEdgesWithParentNode } from "./util/flow";
import "./rubix-flow.css";
import "reactflow/dist/style.css";

const { TabPane } = Tabs;

type SelectableBoxType = {
  edgeId: string;
  rect: DOMRect | null;
};

type UndoStateType = {
  nodes: NodeInterface[];
  edges: Edge[];
  childNode?: NodeInterface[];
  childEdge?: Edge[];
};

type NodeInterfaceWithOldId = NodeInterface & { oldId?: string };

// this is save all nodes
declare global {
  interface Window {
    nodesCopied?: NodeInterface[];
    edgesCopied?: Edge[];
    subFlowIds: string[];
    selectedNodeForExport: NodeInterface | undefined;
    selectedNodeForSubFlow: NodeInterface | undefined;
    allFlow: { nodes: NodeInterface[]; edges: Edge[] }; // save all nodes and edges
    saveCurrentFlowForUndo: () => void;
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
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInterface[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState({} as any);
  const [nodeSelect, setNodeSelect] = useState({} as any);
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>();
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>();
  const [nodeMenuSelectVisibility, setNodeMenuSelectVisibility] = useState<XYPosition>();
  const [isMenuOpenFromNodeTree, setMenuOpenFromNodeTree] = useState(false);
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>();
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
  const [panelKeys, setPanelKeys] = useState<string[]>([]);
  const [panelKeysNew, setPanelKeysNew] = useState<string[]>([]);
  const [isLinkBuilder, setIsLinkBuilder] = useState(false);
  const [undoState, setUndoState] = useState<{ past: UndoStateType[]; future: UndoStateType[] }>({
    past: [],
    future: [],
  });
  const [isChangedFlow, setIsChangedFlow] = useState(false);
  const [search, setSearch] = useState("");

  const isRemote = !!connUUID && !!hostUUID;
  const factory = new FlowFactory();

  const [refreshCounter, incrementRefreshCounter] = useIsLoading((state) => [
    state.refreshCounter,
    state.incrementRefreshCounter,
  ]);

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
      // when draw area to select nodes
      // we will unselected node that is not show in current view
      setTimeout(() => {
        setNodes((nodes) => {
          const nodesL1 = nodes.filter((n: NodeInterface) => {
            return selectedNodeForSubFlow ? selectedNodeForSubFlow.id === n.parentId : !n.parentId;
          });
          const newNodesSelected = nodes.map((node: NodeInterface) => {
            return {
              ...node,
              selected: node.selected ? nodesL1.some((node2: NodeInterface) => node2.id === node.id) : false,
            };
          });
          return newNodesSelected;
        });
      }, 100);
      selectableBoxes.current = [];
      isDragSelection.current = true;
    },
  });

  // Subflow nodes are open
  const changeKeys = (key: string) => {
    const isExist = panelKeys.includes(key);
    setPanelKeys(isExist ? panelKeys.filter((item) => item !== key) : [...panelKeys, key]);
    setPanelKeysNew(isExist ? panelKeys.filter((item) => item === key) : [key]);
  };

  // delete selected wires
  useOnPressKey("Backspace", () => {
    const edgesDeleted = edges.filter((item) => item.selected);
    if (edgesDeleted.length > 0) {
      deleteNodesAndEdges([], edgesDeleted);
    }
  });

  const handleFlowChange = () => setIsChangedFlow(true);

  const handleAddNode = useCallback(
    async (isParent: boolean, style: any, nodeType: string, position: XYPosition, name?: string) => {
      closeNodePicker();
      const nodeSettings = await handleGetSettingType(connUUID, hostUUID, isRemote, nodeType);
      const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, nodeType);
      const newNode = {
        id: generateUuid(),
        info: { nodeName: name ? name : "" },
        isParent,
        style,
        type: nodeType,
        position,
        data: {
          inputs: convertDataSpec(spec.inputs || []),
          out: convertDataSpec(spec.outputs || []),
        },
        parentId: selectedNodeForSubFlow?.id || undefined,
        settings: name ? { ...nodeSettings, point: name } : nodeSettings,
        selected: false,
      };

      onNodesChange([{ type: "add", item: newNode }]);
      window.allFlow.nodes = [...window.allFlow.nodes, newNode];
      setUndoState((s) => {
        s.past.push({ nodes, edges });
        return {
          ...s,
          past: [...s.past],
        };
      });
      handleFlowChange();
      setTimeout(() => {
        setNodes((newNodes) => {
          return newNodes.map((item) => ({ ...item, selected: false }));
        });
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
    [lastConnectStart, nodes, onEdgesChange, onNodesChange, selectedNodeForSubFlow, handleFlowChange]
  );

  const handleAddSubFlow = useCallback((node: NodeInterface) => {
    handlePushSelectedNodeForSubFlow(node);
    setTimeout(() => {
      rubixFlowInstance?.fitView();
    }, 100);
  }, []);

  const handleConnectionBuilderFlow = (node: NodeInterface) => {
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
    setEdges((edges) => edges.map((e) => ({ ...e, selected: false })));
    if (node.id !== selectedNodeForSubFlow?.id) {
      handlePushSelectedNodeForSubFlow(node);
    }
    setIsConnectionBuilder(true);
  };

  const handleLinkBuilder = () => {
    setIsLinkBuilder(true);
  };

  const handleLoadNodesAndEdges = (newNodes: NodeInterface[], newEdges: Edge[]) => {
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

    // just show nodes and edges at level 1
    const nodesFormatted = formatParentNodesWithInputsOutputs(newNodesWithOldId, nodesSpec as any[]);
    const edgesFormatted = formatEdgesWithParentNode(newNodes, finalEdges);

    const newNodesL1 = nodesFormatted.filter((node) => !node.parentId);
    const newEdgesL1 = edgesFormatted.filter((e) =>
      newNodesL1.some((node) => node.id === e.target || node.id === e.source)
    );

    setNodes([...currentNodes, ...newNodesL1]);
    setEdges([...currentEdges, ...newEdgesL1]);
    window.allFlow = {
      nodes: [...window.allFlow.nodes, ...newNodesWithOldId],
      edges: [...window.allFlow.edges, ...finalEdges],
    };
    handleFlowChange();

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      rubixFlowInstance.fitView();
    }, 300);
  };

  const onCloseBuilderModal = () => {
    setIsConnectionBuilder(false);
    setIsLinkBuilder(false);
  };

  const onClearAllNodes = () => {
    saveCurrentFlowForUndo();
    handleFlowChange();
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
  const onBackToMain = useCallback(() => {
    setSelectedNodeForSubFlow([]);
    setIsConnectionBuilder(false);
  }, []);

  const onHandelSaveFlow = async () => {
    setIsSaving(true);
    const allNodes: NodeInterface[] = nodes.map((n: NodeInterface) => {
      if (n.isParent) {
        const originNode = window.allFlow.nodes.find((i) => i.id === n.id) || n;
        return {
          ...n,
          data: originNode?.data || {},
        };
      }
      return n;
    });

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

    try {
      // save nodes and edges
      await factory.DownloadFlow(connUUID, hostUUID, isRemote, graphJson, true);
      setNodes((n) => n.map((item) => ({ ...item, selected: false })));
      setEdges((e) => e.map((item) => ({ ...item, selected: false })));
      window.allFlow = { nodes: newNodesFiltered, edges: window.allFlow.edges };
      setIsChangedFlow(false);
      handleRefreshValues();
    } catch (error) {
      console.log("__ERROR__", error);
    }
    setIsSaving(false);
  };

  const handleStartConnect = (e: any, params: OnConnectStartParams) => {
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

  const createNewConnection = useCallback(
    (
      nodes: NodeInterface[],
      start: { sourceNodeId: string; sourceHandleId: string },
      end: { targetNodeId: string; targetHandleId: string },
      isTarget: boolean
    ) => {
      const { sourceNodeId, sourceHandleId } = start;
      const { targetNodeId, targetHandleId } = end;
      const edgesAdded: Edge[] = [
        {
          id: generateUuid(),
          source: sourceNodeId,
          sourceHandle: sourceHandleId,
          target: targetNodeId,
          targetHandle: targetHandleId,
        },
      ];

      const nodeTarget: NodeInterface = nodes.find((n) => n.id === targetNodeId)!!;
      const nodeSource: NodeInterface = nodes.find((n) => n.id === sourceNodeId)!!;

      // create edge connect to child nodes if have
      if (nodeTarget?.isParent && nodeSource?.isParent) {
        const input = nodeTarget.data.inputs.find((item: any) => item.pin === targetHandleId);
        const output = nodeSource.data.out.find((item: any) => item.pin === sourceHandleId);
        edgesAdded.push({
          id: generateUuid(),
          source: isTarget ? output.nodeId : input.nodeId,
          sourceHandle: isTarget ? "output" : "input",
          target: isTarget ? input.nodeId : output.nodeId,
          targetHandle: isTarget ? "input" : "output",
        });
      } else if (nodeTarget?.isParent) {
        if (isTarget) {
          const input = nodeTarget.data.inputs.find((item: any) => item.pin === targetHandleId);
          edgesAdded.push({
            id: generateUuid(),
            source: sourceNodeId,
            sourceHandle: sourceHandleId,
            target: input.nodeId,
            targetHandle: "input",
          });
        }
      } else if (nodeSource?.isParent) {
        const outputIndex = nodeSource.data.out.findIndex((item: any) => item.pin === sourceHandleId);
        if (outputIndex >= 0) {
          const outItem = nodeSource.data.out[outputIndex];
          edgesAdded.push({
            id: generateUuid(),
            source: outItem.nodeId,
            sourceHandle: "output",
            target: targetNodeId,
            targetHandle: targetHandleId,
          });
        }
      }

      return edgesAdded;
    },
    []
  );

  const onConnectEnd = (evt: ReactMouseEvent | any) => {
    if (lastConnectStart) {
      const { nodeid, handleid, handlepos: position } = (evt.target as HTMLDivElement).dataset;
      const { handleType } = lastConnectStart;
      const isTarget = position === "left";

      const { targetNodeId, targetHandleId } = {
        targetNodeId: isTarget ? nodeid : lastConnectStart.nodeId,
        targetHandleId: isTarget ? handleid : lastConnectStart.handleId,
      };
      const { sourceNodeId, sourceHandleId } = {
        sourceNodeId: !isTarget ? nodeid : lastConnectStart.nodeId!!,
        sourceHandleId: !isTarget ? handleid : lastConnectStart.handleId!!,
      };

      let isRemoveEdge = false;
      const edgeIdsWillBeRemoved: string[] = [];
      const edgesAdded: Edge[] = [];

      const edgeNeedToUpdated: Edge | undefined = edges.find((item) => {
        return (
          item.selected &&
          (item.source === targetNodeId ||
            item.target === sourceNodeId ||
            (!sourceNodeId && item.target === targetNodeId))
        );
      });

      // update target or source
      if (edgeNeedToUpdated) {
        isRemoveEdge = !sourceNodeId;
        edgeIdsWillBeRemoved.push(edgeNeedToUpdated.id);
        if (edgeNeedToUpdated.originEdgeId) {
          edgeIdsWillBeRemoved.push(edgeNeedToUpdated.originEdgeId);
        }
      }

      if (!isRemoveEdge) {
        const isValidConnect = isValidConnection(
          window.allFlow.nodes,
          { nodeId: sourceNodeId!!, handleId: sourceHandleId!!, handleType },
          { nodeId: targetNodeId!!, handleId: targetHandleId!! },
          isTarget
        );

        if (isValidConnect) {
          edgesAdded.push(
            ...createNewConnection(
              nodes,
              {
                sourceNodeId: edgeNeedToUpdated ? edgeNeedToUpdated.source : sourceNodeId!!,
                sourceHandleId: edgeNeedToUpdated ? edgeNeedToUpdated.sourceHandle!! : sourceHandleId!!,
              },
              { targetNodeId: targetNodeId!!, targetHandleId: targetHandleId!! },
              isTarget
            )
          );
        }
      }

      const newEdges = edges.filter((edge) => !edgeIdsWillBeRemoved.includes(edge.id));
      const allEdges = window.allFlow.edges.filter((e) => !edgeIdsWillBeRemoved.includes(e.id));
      allEdges.push(...edgesAdded);
      window.allFlow.edges = allEdges;

      setEdges([...newEdges, ...edgesAdded]);
      setUndoState((s) => ({
        past: [...s.past, { edges, nodes }],
        future: s.future,
      }));
      handleFlowChange();
    }

    setLastConnectStart(undefined);
  };

  const closeNodePicker = () => {
    setLastConnectStart(undefined);
    setNodePickerVisibility(undefined);
    setNodeMenuVisibility(undefined);
    setNodeMenuSelectVisibility(undefined);
    setIsDoubleClick(false);
  };

  const handlePaneClick = (e: ReactMouseEvent) => {
    setNodes(nodes.map((node) => ({ ...node, selected: false })));
    setEdges(edges.map((ed) => ({ ...ed, selected: false })));
    closeNodePicker();
  };

  const onChangeSelection = useCallback(
    ({ nodes: newNodesChange, edges: newEdgesChange }: { nodes: NodeInterface[]; edges: Edge[] }) => {
      if (changeSelectionRef.current) {
        clearTimeout(changeSelectionRef.current);
        changeSelectionRef.current = null;
      }

      if (newNodesChange.length > 0 || newEdgesChange.length > 0) {
        changeSelectionRef.current = setTimeout(() => {
          const nodes = rubixFlowInstance.getNodes();
          const edges = rubixFlowInstance.getEdges();
          const newNodes = nodes.map((node: NodeInterface) => {
            node.selected = newNodesChange.some((i) => i.id === node.id);
            return node;
          });
          const newEdges = edges.map((edge: Edge) => {
            edge.selected = newEdgesChange.some((i) => i.id === edge.id);
            return edge;
          });

          setNodes(newNodes);
          setEdges(newEdges);
        }, 50);
      }
    },
    [rubixFlowInstance]
  );

  const handlePaneContextMenu = (event: ReactMouseEvent) => {
    const { x, y } = setMousePosition(event);
    setNodePickerVisibility({ x, y });
  };

  const handleNodeContextMenu = (event: React.MouseEvent, node: NodeInterface) => {
    if (event.ctrlKey) {
      if (node.isParent && ((event as any).which === 3 || event.button === 2)) {
        event.preventDefault();
        event.stopPropagation();
        handlePushSelectedNodeForSubFlow(node);
        setNodeMenuSelectVisibility(undefined);
        setNodeMenuVisibility(undefined);
        setMenuOpenFromNodeTree(false);
      }
    } else {
      const { x, y } = setMousePosition(event);
      setNodeMenuVisibility({ x, y });
      setSelectedNode(node);
    }
  };

  const handleSelectContextMenu = (event: ReactMouseEvent) => {
    const nodeSelect = nodes.filter((item) => item.selected);

    if (nodeSelect.length > 1) {
      const { x, y } = setMousePosition(event);
      setNodeMenuSelectVisibility({ x, y });
      setNodeSelect(nodeSelect);
    }
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
      if (node.isParent) {
        const nodeOut = outputNodes.find((nodeO) => nodeO.nodeId === node.id);
        const outs = (nodeOut?.outputs || []).filter(
          (out: { pin: string }) => !node.data.out.some((dI: { pin: string }) => dI.pin === out.pin)
        );
        const childrenOfParent = window.allFlow.nodes.filter((n) => n.parentId === node.id);
        const inputs = childrenOfParent.filter((n) => isInputFlow(n.type!!));
        const outputs = childrenOfParent.filter((n) => isOutputFlow(n.type!!));

        inputs.forEach((input, idx) => {
          const inputData = outputNodes.find((o) => o.nodeId === input.id);
          if (inputData) {
            node.data[`input${inputs.length > 1 ? idx + 1 : ""}`] = inputData.inputs[0].value;
            node.data.inputs[idx].value = inputData.inputs[0].value;
          }
        });

        outputs.forEach((outItem, idx) => {
          const outData = outputNodes.find((o) => o.nodeId === outItem.id);
          if (outData) {
            node.data.out[idx].value = outData.inputs[0].value;
          }
        });

        node.data.out = [...(node.data?.out || []), ...outs];
      } else {
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
      }

      return node;
    });
  };

  const handleNodeDragStop = (e: React.MouseEvent, node: any) => {
    const newNodes = nodes.map((item: NodeInterface) => {
      if (item.id === node?.id) {
        return { ...item, position: { ...node.position } };
      }
      return item;
    });
    setNodes(newNodes);
    setUndoState((s) => ({
      past: [...s.past, { edges, nodes }],
      future: [...s.future],
    }));
    handleFlowChange();
  };

  const handleUndo = () => {
    const lastPast = undoState.past.pop();
    if (lastPast) {
      undoState.future.push({ nodes, edges });
      const nodeAdded = lastPast.nodes.filter((n1) => !nodes.some((n2) => n1.id === n2.id));
      const nodeIdsDeleted = nodes.filter((n1) => !lastPast.nodes.some((n2) => n1.id === n2.id)).map(({ id }) => id);
      const nodeChild = lastPast?.childNode || [];
      const nodeIdChild = nodeAdded.map((item) => item.id);
      const nodeChillAdd = nodeChild.filter((item) => !nodeIdChild.includes(item.id));

      window.allFlow.nodes = [
        ...window.allFlow.nodes.filter(({ id }) => !nodeIdsDeleted.includes(id)),
        ...nodeAdded,
        ...nodeChillAdd,
      ];

      const edgeAdded = lastPast.edges.filter((n1) => !edges.some((n2) => n1.id === n2.id));
      const edgeIdsDeleted = edges.filter((n1) => !lastPast.edges.some((n2) => n1.id === n2.id)).map(({ id }) => id);
      const edgeChild = lastPast?.childEdge || [];
      const edgeIdChild = edgeAdded.map((item) => item.id);
      const edgeChillAdd = edgeChild.filter((item) => !edgeIdChild.includes(item.id));

      window.allFlow.edges = [
        ...window.allFlow.edges.filter(({ id }) => !edgeIdsDeleted.includes(id)),
        ...edgeAdded,
        ...edgeChillAdd,
      ];

      setNodes(lastPast.nodes);
      setEdges(lastPast.edges);
      setUndoState({ past: [...undoState.past], future: [...undoState.future] });
      handleFlowChange();
    }
  };

  const handleRedo = () => {
    const lastFuture = undoState.future.pop();
    if (lastFuture) {
      undoState.past.push({ nodes, edges });
      const nodesAdded = lastFuture.nodes.filter((n1) => !nodes.some((n2) => n1.id === n2.id));
      const nodeIdsDeleted = nodes.filter((n1) => !lastFuture.nodes.some((n2) => n1.id === n2.id)).map((n) => n.id);
      window.allFlow.nodes = [...window.allFlow.nodes.filter(({ id }) => !nodeIdsDeleted.includes(id)), ...nodesAdded];

      const edgeAdded = lastFuture.edges.filter((n1) => !edges.some((n2) => n1.id === n2.id));
      const edgesDeleted = edges.filter((n1) => !lastFuture.edges.some((n2) => n1.id === n2.id)).map((n) => n.id);
      window.allFlow.edges = [...window.allFlow.edges.filter(({ id }) => !edgesDeleted.includes(id)), ...edgeAdded];

      setNodes([...lastFuture.nodes]);
      setEdges([...lastFuture.edges]);
      setUndoState({ past: [...undoState.past], future: [...undoState.future] });
      handleFlowChange();
    }
  };

  const getChildNodeIds = (parentId: string) => {
    const childNodes: NodeInterface[] = window.allFlow.nodes.filter(
      (node: NodeInterface) => node.parentId === parentId
    );
    const nodeIds: string[] = [];
    const nodeChild: NodeInterface[] = [];
    for (const node of childNodes) {
      nodeIds.push(node.id);
      nodeChild.push(node);
      if (node.isParent) {
        nodeIds.push(...getChildNodeIds(node.id));
      }
    }
    return nodeIds;
  };

  const getEdgeIdsDeleted = (_edges: Edge[], _nodes: NodeInterface[]): string[] => {
    const edgeIdsDeleted: string[] = [];

    _edges.forEach((item) => {
      const { source, target, targetHandle, sourceHandle } = item;
      const nodeTarget: NodeInterface | undefined = _nodes.find((n) => n.id === target);
      const nodeSource: NodeInterface | undefined = _nodes.find((n) => n.id === source);
      let itemDeleted: Edge | undefined = undefined;

      if (nodeTarget?.isParent && nodeSource?.isParent) {
        const outputOfSource = nodeSource.data.out.find((item: any) => item.pin === sourceHandle);
        const inputOfTarget = nodeTarget.data.inputs.find((item: any) => item.pin === targetHandle);
        itemDeleted = window.allFlow.edges.find(
          (item) => item.target === inputOfTarget.nodeId && item.source === outputOfSource.nodeId
        );
      } else if (nodeSource?.isParent) {
        const outputOfSource = nodeSource.data.out.find((item: any) => item.pin === sourceHandle);
        itemDeleted = window.allFlow.edges.find(
          (item) => item.source === outputOfSource?.nodeId && item.sourceHandle === "output" && item.target === target
        );
      } else if (nodeTarget?.isParent) {
        const inputOfTarget = nodeTarget.data.inputs.find((item: any) => item.pin === targetHandle);
        itemDeleted = window.allFlow.edges.find(
          (item) => item.target === inputOfTarget?.nodeId && item.targetHandle === "input" && item.source === source
        );
      }
      if (itemDeleted) {
        edgeIdsDeleted.push(itemDeleted.id);
      }
    });
    return edgeIdsDeleted;
  };

  const deleteNodesAndEdges = (_nodesDeleted: NodeInterface[], _edgesDeleted: Edge[], saveChange = false) => {
    const nodeIds: string[] = [];
    const _edgeIds: string[] = _edgesDeleted.map((e) => e.id);
    const _edgesDeletedClone = [..._edgeIds];

    for (const node of _nodesDeleted) {
      nodeIds.push(node.id);
      if (node.isParent) {
        nodeIds.push(...getChildNodeIds(node.id));
      }
    }

    const childNode = window.allFlow.nodes.filter((n) => nodeIds.includes(n.id));
    const childEdge = window.allFlow.edges.filter((n) => nodeIds.includes(n.source));

    const remainingNodes = nodes.filter((item) => !nodeIds.includes(item.id));
    const remainingEdges = edges.filter((item) => !_edgeIds.includes(item.id));

    const allRemainingNodes = window.allFlow.nodes.filter((n) => !nodeIds.includes(n.id));

    _edgesDeletedClone.push(...getEdgeIdsDeleted(_edgesDeleted, nodes));

    window.allFlow = {
      nodes: allRemainingNodes,
      edges: window.allFlow.edges.filter((item) => !_edgesDeletedClone.includes(item.id)),
    };
    setNodes(remainingNodes);
    setEdges(remainingEdges);
    setUndoState((s) => ({
      past: [...s.past, { edges, nodes, childNode, childEdge }],
      future: s.future,
    }));
    handleFlowChange();
  };

  // delete nodes when CtrX
  const deleteNodesAndEdgesCtrX = (_nodesDeleted: NodeInterface[], _edgesDeleted: Edge[]) => {
    const nodeWithChildIds: string[] = [];
    for (const node of _nodesDeleted) {
      nodeWithChildIds.push(node.id);
      if (node.isParent) {
        nodeWithChildIds.push(...getChildNodeIds(node.id));
      }
    }

    const nodeIdsDeleted = _nodesDeleted.map((item: NodeInterface) => item.id);
    const childNode = window.allFlow.nodes.filter((n) => nodeIdsDeleted.includes(n.id));
    const childEdge = window.allFlow.edges.filter((n) => nodeIdsDeleted.includes(n.source));
    const remainingNodes = nodes.filter((item) => !nodeIdsDeleted.includes(item.id));
    const remainingNodesAll = window.allFlow.nodes.filter((n) => !nodeIdsDeleted.includes(n.id));
    const remainingEdges = edges.filter(
      (item) =>
        !_edgesDeleted.some((item2) => item.id === item2.id) &&
        !nodeWithChildIds.includes(item.target) &&
        !nodeWithChildIds.includes(item.source)
    );

    window.allFlow = {
      nodes: remainingNodesAll,
      edges: window.allFlow.edges.filter(
        (item) =>
          !_edgesDeleted.some((item2) => item.id === item2.id) &&
          !nodeIdsDeleted.includes(item.target) &&
          !nodeIdsDeleted.includes(item.source)
      ),
    };
    setNodes(remainingNodes);
    setEdges(remainingEdges);
    setUndoState((s) => ({
      past: [...s.past, { edges, nodes, childNode, childEdge }],
      future: s.future,
    }));
    handleFlowChange();
  };

  const handleCopyNodes = async (_copied: { nodes: NodeInterface[]; edges: Edge[] }) => {
    /* Unselected nodes, edges */
    nodes.forEach((item) => (item.selected = false));
    edges.forEach((item) => (item.selected = false));

    // get nodes original
    const newNodesCopied = _copied.nodes.map((node) => {
      if (node.isParent) {
        return window.allFlow.nodes.find((item) => item.id === node.id) || node;
      }
      return node;
    });
    const newEdgesCopied = _copied.edges.map((e) => {
      if (e.originEdgeId) {
        return window.allFlow.edges.find((e2) => e2.id === e.originEdgeId) || e;
      }
      return e;
    });

    /*
     * Generate new id of edges copied
     * Add new id source and target of edges copied
     */
    const newFlow = handleCopyNodesAndEdges(
      { nodes: newNodesCopied, edges: newEdgesCopied },
      window.allFlow.nodes,
      window.allFlow.edges,
      true,
      nodesSpec
    );

    // remove connections if have source or target is not belong to new nodes
    newFlow.edges = newFlow.edges.filter((edge: Edge) => {
      const existSource = newFlow.nodes.some((node: NodeInterface) => node.id === edge.source);
      const existTarget = newFlow.nodes.some((node: NodeInterface) => node.id === edge.target);
      return existSource && existTarget;
    });

    const newNodes = formatParentNodesWithInputsOutputs(newFlow.nodes, nodesSpec as any);
    const newEdges = formatEdgesWithParentNode(newNodes, newFlow.edges);
    const nodesL1 = newNodes.filter((node) => {
      if (!node.parentId) {
        return true;
      }
      return !newNodes.find((item) => item.id === node.parentId);
    });

    // unique items and delete oldId field
    const nodesUniq = uniqArray([...nodes, ...nodesL1]).map(({ oldId, ...node }: NodeInterface) => node);
    const edgesUniq = uniqArray([...edges, ...newEdges]).map(({ oldId, ...edge }: Edge & { oldId?: string }) => edge);

    setNodes(nodesUniq);
    setEdges(edgesUniq);
    setUndoState((s) => ({
      past: [...s.past, { edges, nodes }],
      future: s.future,
    }));
    window.allFlow = {
      nodes: [...window.allFlow.nodes, ...newFlow.nodes],
      edges: [...window.allFlow.edges, ...newEdges],
    };
    handleFlowChange();
  };

  const handleAlignLeft = (position: { x: number; y: number }) => {
    nodes.forEach((item) => {
      if (item.selected) {
        item.position.x = position.x;
      }
    });
  };

  const handleAlignRight = (position: { x: number; y: number }, width: number) => {
    nodes.forEach((item: NodeInterface) => {
      if (item.selected) {
        item.position.x = position.x + (width - item.width!!);
      }
    });
  };

  const handleRefreshValues = async () => {
    const _outputNodes = (await fetchOutput()) || [];
    setTimeout(() => {
      setNodes((prevNodes) => addOutputToNodes(_outputNodes, prevNodes));
    }, 100);
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
    if (event.dataTransfer.getData("from-node-sidebar") !== "") {
      const { isParent, nodeType } = JSON.parse(event.dataTransfer.getData("from-node-sidebar"));
      const position = setMousePosition(event, true);
      handleAddNode(isParent, null, nodeType, position);
    }

    if (event.dataTransfer.getData("from-point-pallet") !== "") {
      const { namePallet, nodeTypePallet } = JSON.parse(event.dataTransfer.getData("from-point-pallet"));
      const position = setMousePosition(event, true);
      handleAddNode(false, null, nodeTypePallet, position, namePallet);
    }
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

  const openNodeMenu = useCallback((position: { x: number; y: number }, node: NodeInterface) => {
    setNodeMenuVisibility(position);
    setSelectedNode(node);
    setMenuOpenFromNodeTree(true);
  }, []);

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

  const gotoNode = useCallback(
    (node: NodeInterface) => {
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
      rubixFlowInstance?.fitView(node.position);
    },
    [rubixFlowInstance]
  );

  useEffect(() => {
    if (!window.allFlow) {
      window.allFlow = { nodes: [], edges: [] };
    }

    if (isFetching) return;

    // save all nodes with latest values
    window.allFlow.nodes = window.allFlow.nodes.map((node) => {
      return nodes.find((node2: NodeInterface) => node2.id === node.id) || node;
    });

    const nodesFormatted = formatParentNodesWithInputsOutputs(window.allFlow.nodes, nodesSpec as Array<any>);
    const edgesFormatted = formatEdgesWithParentNode(window.allFlow.nodes, window.allFlow.edges);

    // get nodes and edges by sub flow or level 1 from all nodes and edges saved
    // when change sub flow
    const nodesL1 = nodesFormatted.filter((node) => {
      return selectedNodeForSubFlow ? selectedNodeForSubFlow.id === node.parentId : !node.parentId;
    });
    const edgesL1 = edgesFormatted.filter((e) => nodesL1.some((node) => node.id === e.target || node.id === e.source));

    setNodes(nodesL1.map((n) => ({ ...n, selected: false })));
    setEdges(edgesL1.map((n) => ({ ...n, selected: false })));
    handleRefreshValues();
    setTimeout(() => {
      rubixFlowInstance?.fitView();
    }, 50);
    setUndoState({ past: [], future: [] });
  }, [selectedNodeForSubFlow]);

  useEffect(() => {
    closeNodePicker();
    factory
      .GetFlow(connUUID, hostUUID, isRemote)
      .then(async (res) => {
        const [_nodes, _edges] = behaveToFlow(res) as [NodeInterface[], Edge[]];
        let newNodes = handleInputEmpty(res.nodes || [], _nodes, nodesSpec as NodeSpecJSON[]);

        const nodesFormatted = formatParentNodesWithInputsOutputs(newNodes, nodesSpec as Array<any>);
        const edgesFormatted = formatEdgesWithParentNode(_nodes, _edges);
        // just show nodes and edges at level 1
        const nodesL1 = nodesFormatted.filter((node) => !node.parentId);
        const edgesL1 = edgesFormatted.filter((e) =>
          nodesL1.some((node) => node.id === e.target || node.id === e.source)
        );

        // tracking all nodes and edges to save
        window.allFlow = { nodes: newNodes, edges: _edges };
        setNodes(nodesL1);
        setEdges(edgesL1);
        /* Get output Nodes */
        handleRefreshValues();
        incrementRefreshCounter();
        setIsFetching(false);
      })
      .catch(() => {
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current);

    refreshInterval.current = setInterval(handleRefreshValues, flowSettings.refreshTimeout * 1000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [flowSettings.refreshTimeout]);

  const saveCurrentFlowForUndo = () => {
    setUndoState((s) => ({
      past: [...s.past, { edges, nodes }],
      future: [...s.future],
    }));
    handleFlowChange();
  };

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    window.saveCurrentFlowForUndo = saveCurrentFlowForUndo;
  }, [saveCurrentFlowForUndo]);

  const nodesParent = useMemo(() => {
    return (window.allFlow?.nodes || []).filter((n) => n.isParent);
  }, [window.allFlow?.nodes]);

  const nodeColor = useCallback((node: any) => {
    if (node.selected) {
      return "#6ede87";
    }
    return "#555";
  }, []);

  const PalletTab = (
    <>
      <UnorderedListOutlined />
      PALLET
    </>
  );
  const NodesTab = (
    <>
      <NodeIndexOutlined />
      NODES
    </>
  );
  const PointsTab = (
    <>
      <ApartmentOutlined />
      POINTS
    </>
  );

  return (
    <div className="rubix-flow">
      {!isFetching && flowSettings.showNodesPallet && (
        <div>
          <div className="p-2">
            <input
              type="text"
              autoFocus
              placeholder="Type to filter"
              className="bg-gray-600 disabled:bg-gray-700 w-full py-1 px-2"
              value={search}
              onChange={onChangeSearch}
            />
          </div>
          <Tabs size="small" centered className="rubix-flow__tabs">
            <TabPane tab={PalletTab} key="Nodes">
              <NodeSideBar nodesSpec={nodesSpec} search={search} />
            </TabPane>
            <TabPane tab={NodesTab} key="Tree">
              <NodesTree
                nodes={window.allFlow?.nodes || []}
                selectedSubFlowId={selectedNodeForSubFlow?.id}
                openNodeMenu={openNodeMenu}
                nodesSpec={nodesSpec}
                gotoNode={gotoNode}
                panelKeys={panelKeys}
                setPanelKeys={setPanelKeys}
                changeKeys={changeKeys}
                flowSettings={flowSettings}
                search={search}
              />
            </TabPane>
            <TabPane tab={PointsTab} key="Points">
              <PointsPallet
                selectedSubflow={selectedNodeForSubFlow}
                // disablePointsPallet={disablePointsPallet}
                // setDisablePointsPallet={setDisablePointsPallet}
                search={search}
              />
            </TabPane>
          </Tabs>
        </div>
      )}

      <div
        className={`rubix-flow__wrapper relative ${flowSettings.showSubFlowTabs ? "has-tabs" : ""}`}
        ref={rubixFlowWrapper}
      >
        {!isFetching && (
          <SubFlowTabs
            nodes={nodesParent}
            selectedSubflow={selectedNodeForSubFlow}
            goSubFlow={handleAddSubFlow}
            onBackToMain={onBackToMain}
            panelKeysNew={panelKeysNew}
          />
        )}
        {isFetching ? (
          <div className="h-full flex">
            <Spin className="m-auto" />
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              onContextMenu={(event: ReactMouseEvent) => {
                handleSelectContextMenu(event);
                setMenuOpenFromNodeTree(false);
              }}
              nodeTypes={customNodeTypes}
              edgeTypes={customEdgeTypes}
              nodes={nodes}
              edges={edges}
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
              {nodeMenuSelectVisibility && (
                <SelectMenu
                  isOpenFromNodeTree={isMenuOpenFromNodeTree}
                  handleAlignLefts={handleAlignLeft}
                  handleAlignRights={handleAlignRight}
                  position={nodeMenuSelectVisibility}
                  node={nodeSelect}
                  onClose={closeNodePicker}
                  selectedNodeForSubFlow={selectedNodeForSubFlow}
                />
              )}
              <LoadWiresMap />
              <LoadBacnetMap deleteNodesAndEdges={deleteNodesAndEdges} />
              <DragSelection />
              {flowSettings.showMiniMap && (
                <MiniMap
                  className={cx("absolute", {
                    "top-20 right-4 h-60": flowSettings.positionMiniMap === "top",
                  })}
                  nodeColor={nodeColor}
                  nodeStrokeWidth={3}
                  zoomable
                  pannable
                />
              )}
              <ControlUndoable
                canUndo={undoState.past.length > 0}
                onUndo={handleUndo}
                canRedo={undoState.future.length > 0}
                onRedo={handleRedo}
              />
              <Controls />
              <Background variant={BackgroundVariant.Lines} color="#353639" style={{ backgroundColor: "#1E1F22" }} />
              <BehaveControls
                isSaving={isSaving}
                isChangedFlow={isChangedFlow}
                deleteNodesAndEdges={deleteNodesAndEdges}
                deleteNodesAndEdgesCtrX={deleteNodesAndEdgesCtrX}
                onCopyNodes={handleCopyNodes}
                onUndo={handleUndo}
                onRedo={handleRedo}
                settings={flowSettings}
                onSaveSettings={onSaveFlowSettings}
                selectedNodeForSubFlow={selectedNodeForSubFlow}
                onClearAllNodes={onClearAllNodes}
                onCloseSubFlow={onCloseSubFlow}
                onBackToMain={onBackToMain}
                onHandelSaveFlow={onHandelSaveFlow}
                onLinkBuilder={handleLinkBuilder}
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
                  handleAlignLefts={handleAlignLeft}
                  handleAlignRights={handleAlignRight}
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
              {!!selectedNodeForSubFlow && isConnectionBuilder && (
                <ConnectionBuilderModal
                  parentNode={selectedNodeForSubFlow}
                  open
                  onClose={onCloseBuilderModal}
                  nodesSpec={nodesSpec}
                />
              )}
              {isLinkBuilder && (
                <LinkBuilderModal
                  parentNode={selectedNodeForSubFlow}
                  open
                  onClose={onCloseBuilderModal}
                  nodesSpec={nodesSpec}
                />
              )}
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
};

export const RubixFlow = () => {
  const [nodesSpec, , isFetchingNodeSpec] = useNodesSpec();
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
    default: (props: EdgeProps) => <CustomEdge {...props} />,
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
        <Spin tip="Loading" size="large" style={{ height: "100%", position: "absolute", top: "50%", left: "60%" }} />
      )}
    </>
  );
};

export default RubixFlow;
