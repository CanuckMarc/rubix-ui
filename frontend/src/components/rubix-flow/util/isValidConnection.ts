import { Connection, ReactFlowInstance } from "reactflow";
import { getSocketsByNodeTypeAndHandleType } from "./getSocketsByNodeTypeAndHandleType";
import { getSpecJson } from "../use-nodes-spec";

export const isValidConnection = (
  connection: Connection,
  instance: ReactFlowInstance
) => {
  if (connection.source === null || connection.target === null) return false;

  const sourceNode = instance.getNode(connection.source);
  const targetNode = instance.getNode(connection.target);

  if (sourceNode === undefined || targetNode === undefined) return false;

  const specJSON = getSpecJson();

  const sourceSockets = getSocketsByNodeTypeAndHandleType(
    specJSON,
    sourceNode.type,
    "source"
  );

  const sourceSocket = (sourceSockets as any)?.find(
    (socket: any) => socket.name === connection.sourceHandle
  );

  const targetSockets = getSocketsByNodeTypeAndHandleType(
    specJSON,
    targetNode.type,
    "target"
  );

  const targetSocket = (targetSockets as any)?.find(
    (socket: any) => socket.name === connection.targetHandle
  );

  if (sourceSocket === undefined || targetSocket === undefined) return false;

  return sourceSocket.valueType === targetSocket.valueType;
};
