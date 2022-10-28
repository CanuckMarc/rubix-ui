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
  Node as FlowNode,
} from "react-flow-renderer/nocss";
import useUndoable from "use-undoable";

import BehaveControls from "./components/Controls";
import NodePicker from "./components/NodePicker";
import NodeMenu from "./components/NodeMenu";
import { Node as NodePanel } from "./components/Node";
import { calculateNewEdge } from "./util/calculateNewEdge";
import { getNodePickerFilters } from "./util/getPickerFilters";
import { CustomEdge } from "./components/CustomEdge";
import { generateUuid } from "./lib/generateUuid";
import { ReactFlowProvider } from "react-flow-renderer";
import { useNodesSpec } from "./use-nodes-spec";
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
  getNumberRefresh,
  NUMBER_REFRESH,
} from "./components/SettingRefreshModal";

const edgeTypes = {
  default: CustomEdge,
};

const Flow = (props: any) => {
  const { customNodeTypes } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([] as NodeInterface[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
  const [numberRefresh, setNumberRefresh] = useState(getNumberRefresh());
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;

  const factory = new FlowFactory();

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
      const newNode = {
        id: generateUuid(),
        isParent,
        style,
        type: nodeType,
        position,
        data: {},
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

  const handleStopConnect = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    if (element.classList.contains("react-flow__pane")) {
      setNodePickerVisibility({ x: e.clientX, y: e.clientY });
    } else {
      setLastConnectStart(undefined);
    }
  };

  const closeNodePicker = () => {
    setLastConnectStart(undefined);
    setNodePickerVisibility(undefined);
    setNodeMenuVisibility(undefined);
    setIsDoubleClick(false);
  };

  const handlePaneClick = () => closeNodePicker();

  const handlePaneContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    setNodePickerVisibility({ x: e.clientX, y: e.clientY });
  };

  const handleNodeContextMenu = (e: ReactMouseEvent, node: NodeInterface) => {
    e.preventDefault();
    setNodeMenuVisibility({ x: e.clientX, y: e.clientY });
    setSelectedNode(node);
  };
  
  const handleClickNode = (e: ReactMouseEvent, node: NodeInterface) => {
    if (e.ctrlKey || e.metaKey) {
      handleNodeContextMenu(e, node);
    }
  }

  const handleOnClick = (e: ReactMouseEvent) => {
    const element = e.target as HTMLElement;
    if ((e.ctrlKey || e.metaKey) && element.classList.contains("react-flow__pane")) {
      handlePaneContextMenu(e);
    }
  };

  const fetchOutput = async () => {
    try {
      return (await factory.NodeValues(connUUID, hostUUID, isRemote)) || [];
    } catch (error) {
      console.log(error);
    }
  };

  const addOutputToNodes = (outputNodes: Array<any>, prevNodes: Array<any>) => {
    if (outputNodes && outputNodes.length === 0) return prevNodes;

    return prevNodes.map((node) => {
      const index = outputNodes.findIndex((item) => item.nodeId === node.id);
      node.data.inputs = outputNodes[index]?.inputs;
      node.data.out = outputNodes[index]?.outputs;
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

  const handleCopyNodes = async (_copied: { nodes: any; edges: any }) => {
    /* Unselected nodes, edges */
    nodes.forEach((item) => (item.selected = false));
    edges.forEach((item) => (item.selected = false));

    /* Generate new id of nodes copied */
    _copied.nodes = _copied.nodes.map((item: any) => {
      const __newNodeId = generateUuid();

      /*
       * Generate new id of edges copied
       * Add new id source and target of edges copied
       */
      _copied.edges = _copied.edges.map((edge: any) => ({
        ...edge,
        id: generateUuid(),
        source: edge.source === item.id ? __newNodeId : edge.source,
        target: edge.target === item.id ? __newNodeId : edge.target,
        selected: true,
      }));

      return {
        ...item,
        id: __newNodeId,
        position: { x: item.position.x + 10, y: item.position.y - 10 },
        selected: true,
      };
    });

    _copied.nodes = await handleNodesEmptySettings(
      connUUID,
      hostUUID,
      isRemote,
      _copied.nodes
    );

    const _nodes = [...nodes, ..._copied.nodes];
    const _edges = [...edges, ..._copied.edges];
    setNodes(_nodes);
    setEdges(_edges);
    setUndoable({ edges: _edges, nodes: _nodes });
  };

  const handleRefreshValues = async () => {
    const _outputNodes = (await fetchOutput()) || [];
    setNodes((prevNodes) => addOutputToNodes(_outputNodes, prevNodes));
  };

  const handleChangeNumberRefresh = (value: number) => {
    localStorage.setItem(NUMBER_REFRESH, value.toString());
    setNumberRefresh(value);
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
      numberRefresh * 1000
    );

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [numberRefresh]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodeTypes={customNodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={handleStartConnect}
        onConnectStop={handleStopConnect}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={(e, node: any) => handleNodeContextMenu(e, node)}
        onNodeClick={handleClickNode}
        onClick={handleOnClick}
        fitViewOptions={{ maxZoom: 1 }}
        deleteKeyCode={["Delete"]}
        onNodeDragStop={handleNodeDragStop}
        multiSelectionKeyCode={["AltLeft", "AltRight"]}
      >
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
          onNumberRefresh={handleChangeNumberRefresh}
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
    </ReactFlowProvider>
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
