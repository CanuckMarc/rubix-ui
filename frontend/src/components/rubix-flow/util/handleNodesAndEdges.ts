import { Edge } from "react-flow-renderer";
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
  allData: NodesAndEdgesType = {
    nodes: [],
    edges: [],
  },
  isAutoSelected = true
) => {
  let newEdges: Edge[] = [...flow.edges];

  const subNodes: NodeWithOldId[] = [];
  const subEdges: Edge[] = [];

  /* Generate new id of nodes */
  const newNodes: NodeInterface[] = flow.nodes.map((item) => {
    const newNodeId = generateUuid();

    if (item.isParent) {
      const subChildren = allData.nodes
        .filter(n => n.parentId === item.id)
        .map(child => ({
          ...child,
          id: generateUuid(),
          oldId: child.id,
          parentId: newNodeId,
        }));
      subNodes.push(...subChildren);
    }

    /*
     * Generate new id of edges
     * Add new id source and target of edges
     */
    newEdges = newEdges.map((edge) => ({
      ...edge,
      id: generateUuid(),
      source: edge.source === item.id ? newNodeId : edge.source,
      target: edge.target === item.id ? newNodeId : edge.target,
      selected: isAutoSelected,
    }));

    return {
      ...item,
      id: newNodeId,
      position: { x: item.position.x + 10, y: item.position.y - 10 },
      selected: isAutoSelected,
      data: {
        ...item.data,
        input: undefined,
        output: undefined,
      },
    };
  });

  allData.edges.forEach((edge) => {
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

  return {
    nodes: uniqArray([...newNodes, ...subNodes]),
    edges: uniqArray([...newEdges, ...subEdges]),
  };
};
