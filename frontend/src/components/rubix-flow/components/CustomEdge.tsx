import { memo, useEffect, useRef, useState } from "react";
import { Position } from "react-flow-renderer";
import { Edge, EdgeProps, getBezierPath, useEdges, useNodes } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { isInputFlow, isOutputFlow } from "./Node";

export const CustomEdge = memo((props: EdgeProps & { parentNodeId?: string }) => {
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
  const nodes: NodeInterface[] = useNodes();
  const edges: Edge[] = useEdges();
  const [shouldShow, setShouldShow] = useState(true);
  const refPath1 = useRef<SVGPathElement>(null);
  const refPath2 = useRef<SVGPathElement>(null);

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

    let show = parentNodeId
      ? nodeIdsShowing.includes(edge.target) && nodeIdsShowing.includes(edge.source)
      : nodeIdsShowing.includes(edge.target) || nodeIdsShowing.includes(edge.source);
    let showParentNodeAsSourceOrTarget = false;
    let pathObj = null;
    let showConnectBetweenSubAndNode = false;

    if (!show) {
      const nodeTarget = nodes.find((n) => n.id === edge.target);
      const nodeSource = nodes.find((n) => n.id === edge.source);
      show =
        nodeIdsShowing.includes(nodeTarget?.parentId as string) &&
        nodeIdsShowing.includes(nodeSource?.parentId as string) &&
        nodeTarget?.parentId !== nodeSource?.parentId;

      if (show) {
        showParentNodeAsSourceOrTarget = true;
      }

      if (!show && parentNodeId && (!nodeTarget?.isParent || !nodeSource?.isParent)) {
        const targetIsNormalNode = !nodeTarget?.isParent && nodeIdsShowing.includes(nodeTarget?.id!!);

        showConnectBetweenSubAndNode = targetIsNormalNode
          ? nodeIdsShowing.includes(nodeTarget?.id!!) && nodeIdsShowing.includes(nodeSource?.parentId!!)
          : nodeIdsShowing.includes(nodeSource?.id!!) && nodeIdsShowing.includes(nodeTarget?.parentId!!);
      }
    }

    // show connect normal at main flow
    if (show && !showParentNodeAsSourceOrTarget) {
      const targetNode = nodes.find((item: NodeInterface) => item.id === edge.target);
      const sourceNode = nodes.find((item: NodeInterface) => item.id === edge.source);
      const parentNode = nodes.find(
        (item: NodeInterface) => item.id === targetNode?.parentId || item.id === sourceNode?.parentId
      );
      const childNodes: NodeInterface[] = nodes.filter((item: NodeInterface) => item.parentId === parentNode?.id);

      const inputNodes = childNodes.filter((n: NodeInterface) => isInputFlow(n.type!!));
      const outputNodes = childNodes.filter((n: NodeInterface) => isOutputFlow(n.type!!));

      const targetIndex = inputNodes.findIndex((n) => n.id === edge.target);
      const sourceIndex = outputNodes.findIndex((n) => n.id === edge.source);
      const isHaveSubName = !!parentNode?.info?.nodeName || !!parentNode?.status?.waringIcon;
      const startPosition = isHaveSubName ? 70 : 48;

      const newSourceX = sourceIndex >= 0 && parentNode ? parentNode!!.position.x + parentNode.width!! + 7 : sourceX;
      const newSourceY =
        sourceIndex >= 0 && parentNode ? parentNode!!.position.y + (startPosition + sourceIndex * 32) : sourceY;
      const newSourcePosition = sourceIndex >= 0 ? Position.Right : sourcePosition;
      const newTargetX = targetIndex >= 0 && parentNode ? parentNode!!.position.x - 7 : targetX;
      const newTargetY =
        targetIndex >= 0 && parentNode ? parentNode!!.position.y + (startPosition + targetIndex * 32) : targetY;
      const newTargetPosition = targetIndex >= 0 ? Position.Left : targetPosition;

      pathObj = {
        sourceX: parentNodeId ? sourceX : newSourceX,
        sourceY: parentNodeId ? sourceY : newSourceY,
        sourcePosition: parentNodeId ? sourcePosition : newSourcePosition,
        targetX: parentNodeId ? targetX : newTargetX,
        targetY: parentNodeId ? targetY : newTargetY,
        targetPosition: parentNodeId ? targetPosition : newTargetPosition,
      };
    }

    // show connect between subs flow
    if (showParentNodeAsSourceOrTarget) {
      const nodeTarget = nodes.find((item: NodeInterface) => item.id === edge.target);
      const nodeSource = nodes.find((item: NodeInterface) => item.id === edge.source);
      const parentNodeTarget = nodes.find((item: NodeInterface) => item.id === nodeTarget?.parentId);
      const parentNodeSource = nodes.find((item: NodeInterface) => item.id === nodeSource?.parentId);

      const parentSourceHaveName = !!parentNodeSource?.info?.nodeName || !!parentNodeSource?.status?.waringIcon;
      const parentTargetHaveName = !!parentNodeTarget?.info?.nodeName || !!parentNodeTarget?.status?.waringIcon;
      const startPosition = parentSourceHaveName ? 70 : 48;
      const endPosition = parentTargetHaveName ? 70 : 48;

      // handle parent node start position when showParentNodeAsSourceOrTarget = true
      const outputNodesOfParentSource = nodes
        .filter((item: NodeInterface) => item.parentId === parentNodeSource?.id)
        .filter((n: NodeInterface) => isOutputFlow(n.type!!));

      const sourceIndexOfParentSource = outputNodesOfParentSource.findIndex((n) => n.id === nodeSource?.id);
      const newSourcePositionX = parentNodeSource
        ? parentNodeSource.position.x + parentNodeSource.width!! + 7
        : sourceX;
      const newSourcePositionY = parentNodeSource
        ? parentNodeSource.position.y + (startPosition + sourceIndexOfParentSource * 32)
        : sourceX;
      // --end of parent node start position

      // handle parent node end position when showParentNodeAsSourceOrTarget = true
      const inputNodesOfParentSource = nodes
        .filter((item: NodeInterface) => item.parentId === parentNodeTarget?.id)
        .filter((n: NodeInterface) => isInputFlow(n.type!!));

      const targetIndexOfParentSource = inputNodesOfParentSource.findIndex((n) => n.id === nodeTarget?.id);
      const newTargetPositionX = parentNodeTarget ? parentNodeTarget.position.x - 7 : sourceX;
      const newTargetPositionY = parentNodeTarget
        ? parentNodeTarget.position.y + (endPosition + targetIndexOfParentSource * 32)
        : sourceX;
      // --end of parent node end position

      const newSourcePosition = sourceIndexOfParentSource >= 0 ? Position.Right : sourcePosition;
      const newTargetPosition = targetIndexOfParentSource >= 0 ? Position.Left : targetPosition;

      pathObj = {
        sourceX: newSourcePositionX,
        sourceY: newSourcePositionY,
        sourcePosition: newSourcePosition,
        targetX: newTargetPositionX,
        targetY: newTargetPositionY,
        targetPosition: newTargetPosition,
      };
    }

    // show connect between sub flow and normal node
    if (showConnectBetweenSubAndNode) {
      const nodeTarget = nodes.find((item: NodeInterface) => item.id === edge.target);
      const nodeSource = nodes.find((item: NodeInterface) => item.id === edge.source);
      const targetIsNormalNode = !nodeTarget?.isParent && nodeIdsShowing.includes(nodeTarget?.id!!);

      if (targetIsNormalNode) {
        const parentNodeSource = nodes.find((item: NodeInterface) => item.id === nodeSource?.parentId);
        const parentSourceHaveName = !!parentNodeSource?.info?.nodeName || !!parentNodeSource?.status?.waringIcon;
        const startPosition = parentSourceHaveName ? 70 : 48;

        // handle parent node start position when showParentNodeAsSourceOrTarget = true
        const outputNodesOfParentSource = nodes
          .filter((item: NodeInterface) => item.parentId === parentNodeSource?.id)
          .filter((n: NodeInterface) => isOutputFlow(n.type!!));

        const sourceIndexOfParentSource = outputNodesOfParentSource.findIndex((n) => n.id === nodeSource?.id);
        const newSourcePositionX = parentNodeSource!!.position.x + parentNodeSource!!.width!! + 7;
        const newSourcePositionY = parentNodeSource!!.position.y + (startPosition + sourceIndexOfParentSource * 32);

        pathObj = {
          sourceX: newSourcePositionX,
          sourceY: newSourcePositionY,
          targetX: targetX,
          targetY: targetY,
          sourcePosition: sourcePosition,
          targetPosition: targetPosition,
        };
      } else {
        const parentNodeTarget = nodes.find((item: NodeInterface) => item.id === nodeTarget?.parentId);
        const parentTargetHaveName = !!parentNodeTarget?.info?.nodeName || !!parentNodeTarget?.status?.waringIcon;
        const endPosition = parentTargetHaveName ? 70 : 48;

        const inputNodesOfParentSource = nodes
          .filter((item: NodeInterface) => item.parentId === parentNodeTarget?.id)
          .filter((n: NodeInterface) => isInputFlow(n.type!!));
        const targetIndexOfParentSource = inputNodesOfParentSource.findIndex((n) => n.id === nodeTarget?.id);

        if (parentNodeTarget) {
          const newTargetPositionX = parentNodeTarget!!.position.x - 7;
          const newTargetPositionY = parentNodeTarget!!.position.y + (endPosition + targetIndexOfParentSource * 32);

          pathObj = {
            sourceX: sourceX,
            sourceY: sourceY,
            targetX: newTargetPositionX,
            targetY: newTargetPositionY,
            sourcePosition: sourcePosition,
            targetPosition: targetPosition,
          };
        }
      }
    }

    if (show !== shouldShow || showConnectBetweenSubAndNode !== shouldShow) {
      setShouldShow(show || showConnectBetweenSubAndNode);
    }

    if ((show || showConnectBetweenSubAndNode) && pathObj && refPath1.current && refPath2.current) {
      const path = getBezierPath(pathObj);
      refPath1.current.setAttribute("d", path);
      refPath2.current.setAttribute("d", path);
    }
  }, [parentNodeId, edges, nodes]);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path edge-path-bg" ref={refPath1} />
      <path id={id} style={style} className="react-flow__edge-path" ref={refPath2} />
    </>
  );
});
