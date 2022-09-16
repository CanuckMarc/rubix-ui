import { Node, OnConnectStartParams } from "react-flow-renderer/nocss";
import { getSocketsByNodeTypeAndHandleType } from "./getSocketsByNodeTypeAndHandleType";
import { NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { useNodesSpec } from "../use-nodes-spec";

export const calculateNewEdge = (
  originNode: Node,
  destinationNodeType: string,
  destinationNodeId: string,
  connection: OnConnectStartParams
) => {
  const [nodesSpec] = useNodesSpec();
  const specJSON = nodesSpec as NodeSpecJSON[];

  const sockets = getSocketsByNodeTypeAndHandleType(
    specJSON,
    originNode.type,
    connection.handleType
  );
  const originSocket = sockets?.find(
    (socket: any) => socket.name === connection.handleId
  );

  const newSockets = getSocketsByNodeTypeAndHandleType(
    specJSON,
    destinationNodeType,
    connection.handleType === "source" ? "target" : "source"
  );
  const newSocket = newSockets?.find(
    (socket: any) => socket.valueType === originSocket?.valueType
  );

  if (connection.handleType === "source") {
    return {
      id: generateUuid(),
      source: connection.nodeId ?? "",
      sourceHandle: connection.handleId,
      target: destinationNodeId,
      targetHandle: newSocket?.name,
    };
  }

  return {
    id: generateUuid(),
    target: connection.nodeId ?? "",
    targetHandle: connection.handleId,
    source: destinationNodeId,
    sourceHandle: newSocket?.name,
  };
};
