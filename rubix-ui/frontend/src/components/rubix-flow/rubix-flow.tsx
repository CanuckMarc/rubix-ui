import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
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
import { Node, NodeSpecJSON } from "./lib";
import { FlowFactory } from "./factory";
import { behaveToFlow } from "./transformers/behaveToFlow";

const edgeTypes = {
  default: CustomEdge,
};

const Flow = (props: any) => {
  const { customNodeTypes } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState({} as any);
  const [nodePickerVisibility, setNodePickerVisibility] =
    useState<XYPosition>();
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>();
  const [lastConnectStart, setLastConnectStart] =
    useState<OnConnectStartParams>();

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
    (isParent: boolean, style: any, nodeType: string, position: XYPosition) => {
      closeNodePicker();
      const newNode = {
        id: generateUuid(),
        isParent,
        style,
        type: nodeType,
        position,
        data: {},
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
  };

  const handlePaneClick = () => closeNodePicker();

  const handlePaneContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    setNodePickerVisibility({ x: e.clientX, y: e.clientY });
  };

  const handleNodeContextMenu = (e: ReactMouseEvent, node: any) => {
    e.preventDefault();
    setNodeMenuVisibility({ x: e.clientX, y: e.clientY });
    setSelectedNode(node);
  };

  const fetchOutput = async () => {
    try {
      return (await factory.NodeValues()) || [];
    } catch (error) {
      console.log(error);
    }
  };

  const addOutputToNodes = (outputNodes: Array<any>, prevNodes: Array<any>) => {
    if (outputNodes.length === 0) return prevNodes;

    return prevNodes.map((node) => {
      const index = outputNodes.findIndex((item) => item.nodeId === node.id);
      const value = outputNodes[index]?.outputs;

      node.data.out = value;

      return node;
    });
  };

  useEffect(() => {
    factory
      .GetFlow()
      .then((res) => {
        const [_nodes, _edges] = behaveToFlow(res);
        setNodes(_nodes);
        setEdges(_edges);
      })
      .catch(() => {});

    const ivlFetchOutput = setInterval(async () => {
      const _outputNodes = (await fetchOutput()) || [];
      setNodes((prevNodes) => addOutputToNodes(_outputNodes, prevNodes));
    }, 5000);

    return () => {
      clearInterval(ivlFetchOutput);
    };
  }, []);

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
        fitViewOptions={{ maxZoom: 1 }}
        deleteKeyCode={["Delete"]}
      >
        <Controls />
        <Background
          variant={BackgroundVariant.Lines}
          color="#353639"
          style={{ backgroundColor: "#1E1F22" }}
        />
        <BehaveControls />
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
          />
        )}
      </ReactFlow>
    </ReactFlowProvider>
  );
};

export const RubixFlow = () => {
  const [nodesSpec] = useNodesSpec();

  const customNodeTypes = (nodesSpec as NodeSpecJSON[]).reduce(
    (nodes, node) => {
      nodes[node.type] = (props: any) => <NodePanel {...props} spec={node} />;
      return nodes;
    },
    {} as NodeTypes
  );

  return (
    <>
      {nodesSpec.length > 0 ? (
        <Flow customNodeTypes={customNodeTypes} />
      ) : (
        <Spin />
      )}
    </>
  );
};

export default RubixFlow;
