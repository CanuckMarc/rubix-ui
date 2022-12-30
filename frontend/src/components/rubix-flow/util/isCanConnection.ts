import { Edge, OnConnectStartParams } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type LastConnectParams = {
  nodeId: string;
  handleId: string;
};

export const isValidConnection = (
  nodes: NodeInterface[],
  firstConnect: OnConnectStartParams,
  lastConnect: LastConnectParams,
  isTarget : boolean
) => {
  const firstNode = nodes.find((item) => item.id === firstConnect.nodeId);
  const lastNode = nodes.find((item) => item.id === lastConnect.nodeId);

  const nodeTarget = nodes.find((item) => item.id === lastConnect.nodeId);
  const tempArr = isTarget ? nodeTarget!!.data.inputs : nodeTarget!!.data.out;

  const dataTypeOfTarget = tempArr.find((i: any) => i.pin === lastConnect.handleId);

  const nodeSource = nodes.find((item) => item.id === firstConnect?.nodeId);

  const tempArr2 = isTarget ? nodeSource!!.data.out : nodeSource!!.data.inputs;
  const dataTypeOfSource = tempArr2.find((i: any) => i.pin === firstConnect?.handleId);

  if (!firstNode || !lastNode) return false;
  
  
  const arrHandleIds = [
    dataTypeOfSource.dataType,
    dataTypeOfTarget.dataType,
  ];
  const occurrences = arrHandleIds.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
  }, {}); /* eg return: {string: 1:, boolean: 1} */
  const occString = occurrences["string"];

  return !occString || occString === 2;
};


/* Max one connection per input */
export const isInputExistConnection = (
  edges: Edge[],
  connTarget: string,
  connTargetHandle: string,
  param: "target" | "source" = "target",
) => {
  return !!edges.find(
    (edge) =>
      edge[param] === connTarget && edge[`${param}Handle`] === connTargetHandle
  );
};
