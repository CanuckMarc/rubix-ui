import { Edge } from "reactflow";

import { NodeSpecJSON } from "../lib";
import { uniqArray } from '../../../utils/utils';
import { generateUuid } from "../lib/generateUuid";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type NodeWithOldId = NodeInterface & { oldId: string; };

type NodesAndEdgesType = {
  nodes: NodeInterface[];
  edges: Edge[];
};

export const handleCopyNodesAndEdges = (
  flow: NodesAndEdgesType,
  nodes: NodeInterface[] = [],
  edges: Edge[] = [],
  isAutoSelected = true,
) => {
  let newEdges: Edge[] = [...flow.edges];
  const subNodes: NodeWithOldId[] = [];
  const subEdges: Edge[] = [];

  const copyAllNode = (id: string, newId: string) => {
    const childNodes = nodes.filter((node: NodeInterface) => id === node.parentId);

    childNodes.forEach((item: NodeInterface) => {
      const childNodeId = generateUuid();
      subNodes.push({ ...item, oldId: item.id, id: childNodeId, parentId: newId });

      if (item.isParent) {
        copyAllNode(item.id, childNodeId);
      }
    });
  };

  /* Generate new id of nodes */
  const newNodes: NodeInterface[] = flow.nodes.map((item) => {
    const newNodeId = generateUuid();
    subNodes.push({ ...item, id: newNodeId, oldId: item.id });
    copyAllNode(item.id, newNodeId);
    /*
     * Generate new id of edges
     * Add new id source and target of edges
     */
    newEdges = newEdges.map((edge) => ({
      ...edge,
      oldId: edge.id,
      id: generateUuid(),
      source: edge.source === item.id ? newNodeId : edge.source,
      target: edge.target === item.id ? newNodeId : edge.target,
      selected: isAutoSelected,
    }));

    return {
      ...item,
      oldId: item.id,
      id: newNodeId,
      position: { x: item.position.x + 10, y: item.position.y - 10 },
      selected: isAutoSelected,
      data: { ...item.data },
    };
  });

  edges.forEach((edge) => {
    const itemClone = subNodes.find((node: NodeWithOldId) => node.oldId === edge.target || node.oldId === edge.source);
    if (itemClone) {
      const target = subNodes.find((node: NodeWithOldId) => node.oldId === edge.target);
      const source = subNodes.find((node: NodeWithOldId) => node.oldId === edge.source);
      subEdges.push({
        ...edge,
        id: generateUuid(),
        source: source?.id || edge.source,
        target: target?.id || edge.target,
      });
    }
  });

  const allNodes = uniqArray([...newNodes, ...subNodes]).map((node) => {
    if (node.isParent) {
      node.data = {};
    }
    return node;
  });

  return {
    nodes: allNodes,
    edges: uniqArray([...newEdges, ...subEdges]),
  };
};