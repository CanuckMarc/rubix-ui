import { useEffect, useState } from "react";
import { Edge, EdgeProps, getBezierPath, useEdges, useNodes } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  parentNodeId = undefined,
}: EdgeProps & { parentNodeId?: string }) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const nodes = useNodes();
  const edges = useEdges();
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const edge = edges.find((item) => item.id === id) || ({} as Edge);

    const nodeIdsShowing = nodes
      .filter((n: NodeInterface) => {
        if (parentNodeId) {
          return n.parentId === parentNodeId;
        }
        return !n.parentId;
      })
      .map((n: NodeInterface) => n.id);

    const show = parentNodeId
      ? nodeIdsShowing.includes(edge.target) && nodeIdsShowing.includes(edge.source)
      : !(!nodeIdsShowing.includes(edge.target) && !nodeIdsShowing.includes(edge.source));

    setShouldShow(show);
  }, [parentNodeId]);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path edge-path-bg" d={edgePath} />
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} />
    </>
  );
};
