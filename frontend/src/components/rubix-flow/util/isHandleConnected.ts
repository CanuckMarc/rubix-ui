import { Edge } from "react-flow-renderer/nocss";
import { SPLIT_KEY } from '../hooks/useChangeNodeData';

export const isHandleConnected = (
  edges: Edge[],
  nodeId: string,
  handleId: string,
  type: "source" | "target"
) => {
  return edges.some(
    (edge) => edge[type] === nodeId && edge[`${type}Handle`] === handleId?.split(SPLIT_KEY)[0]
  );
};
