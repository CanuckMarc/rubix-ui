import { useEffect, useState } from "react";
import { Position } from "react-flow-renderer";
import { Edge, EdgeProps, getBezierPath, useEdges, useNodes } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

export const CustomEdge = (props: EdgeProps & { parentNodeId?: string }) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    parentNodeId = undefined,
  } = props;
  const [path, setPath] = useState<any>(null);
  const nodes: NodeInterface[] = useNodes();
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
      : nodeIdsShowing.includes(edge.target) || nodeIdsShowing.includes(edge.source);

    if (show) {
      const targetNode = nodes.find((item: NodeInterface) => item.id === edge.target);
      const sourceNode = nodes.find((item: NodeInterface) => item.id === edge.source);
      const parentNode = nodes.find(
        (item: NodeInterface) => item.id === targetNode?.parentId || item.id === sourceNode?.parentId
      );
      const childNodes: NodeInterface[] = nodes.filter((item: NodeInterface) => item.parentId === parentNode?.id);

      const inputNodes = childNodes.filter((n: NodeInterface) => {
        const type = n.type!!.split("/")?.[1];
        return ["input-float", "input-string", "input-bool"].includes(type);
      });

      const outputNodes = childNodes.filter((n: NodeInterface) => {
        const type = n.type!!.split("/")?.[1];
        return ["output-float", "output-string", "output-bool"].includes(type);
      });

      const targetIndex = inputNodes.findIndex((n) => n.id === edge.target);
      const sourceIndex = outputNodes.findIndex((n) => n.id === edge.source);

      const newSourceX = sourceIndex >= 0 && parentNode ? parentNode!!.position.x + parentNode.width!! + 7 : sourceX;
      const newSourceY = sourceIndex >= 0 && parentNode ? parentNode!!.position.y + (48 + sourceIndex * 32) : sourceY;
      const newSourcePosition = sourceIndex >= 0 ? Position.Right : sourcePosition;
      const newTargetX = targetIndex >= 0 && parentNode ? parentNode!!.position.x - 7 : targetX;
      const newTargetY = targetIndex >= 0 && parentNode ? parentNode!!.position.y + (48 + targetIndex * 32) : targetY;
      const newTargetPosition = targetIndex >= 0 ? Position.Left : targetPosition;

      setPath(
        getBezierPath({
          sourceX: parentNodeId ? sourceX : newSourceX,
          sourceY: parentNodeId ? sourceY : newSourceY,
          sourcePosition: parentNodeId ? sourcePosition : newSourcePosition,
          targetX: parentNodeId ? targetX : newTargetX,
          targetY: parentNodeId ? targetY : newTargetY,
          targetPosition: parentNodeId ? targetPosition : newTargetPosition,
        })
      );
    }

    setShouldShow(show);
  }, [parentNodeId, edges, nodes]);

  if (!shouldShow || !path) {
    return null;
  }

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path edge-path-bg" d={path} />
      <path id={id} style={style} className="react-flow__edge-path" d={path} />
    </>
  );
};
