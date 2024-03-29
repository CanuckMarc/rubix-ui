import { Edge } from "reactflow";

import { NodeSpecJSON } from "../lib";
import { uniqArray } from "../../../utils/utils";
import { generateUuid } from "../lib/generateUuid";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { convertDataSpec } from '../use-nodes-spec';

type NodeWithOldId = NodeInterface & { oldId: string; };

type NodesAndEdgesType = {
  nodes: NodeInterface[];
  edges: Edge[];
};

const cloneEdges = (edges: Edge[], subNodes: NodeWithOldId[]): Edge[] => {
  const edgesCloned: Edge[] = [];
  edges.forEach((edge) => {
    const itemClone = subNodes.find(
      (node: NodeWithOldId) =>
        node.oldId === edge.target || node.oldId === edge.source
    );
    if (itemClone) {
      const target = subNodes.find(
        (node: NodeWithOldId) => node.oldId === edge.target
      );
      const source = subNodes.find(
        (node: NodeWithOldId) => node.oldId === edge.source
      );
      edgesCloned.push({
        ...edge,
        id: generateUuid(),
        source: source?.id || edge.source,
        target: target?.id || edge.target,
      });
    }
  });
  return edgesCloned;
};

export const handleCopyNodesAndEdges = (
  flow: NodesAndEdgesType,
  nodes: NodeInterface[] = [],
  edges: Edge[] = [],
  isAutoSelected = true,
  nodesSpec:
    | boolean
    | NodeSpecJSON[]
    | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>
) => {
  let newEdges: Edge[] = [...edges];
  const subNodes: NodeWithOldId[] = [];
  const subEdges: Edge[] = [];

  const copyAllNode = (id: string, newId: string) => {
    const childNodes = nodes.filter(
      (node: NodeInterface) => id === node.parentId
    );

    childNodes.forEach((item: NodeInterface) => {
      const childNodeId = generateUuid();
      const specNOde = (nodesSpec as NodeSpecJSON[]).find(it => it.type === item.type);

      subNodes.push({
        ...item,
        data: {
          inputs: convertDataSpec(specNOde!!.inputs || []),
          out: convertDataSpec(specNOde!!.outputs || []),
        },
        oldId: item.id,
        id: childNodeId,
        parentId: newId,
      });

      if (item.isParent) {
        copyAllNode(item.id, childNodeId);
      }
    });
  };

  /* Generate new id of nodes */
  const newNodes: NodeInterface[] = flow.nodes.map((item) => {
    const newNodeId = generateUuid();
    const specNOde = (nodesSpec as NodeSpecJSON[]).find(it => it.type === item.type);

    item.data = {
      inputs: convertDataSpec(specNOde!!.inputs || []),
      out: convertDataSpec(specNOde!!.outputs || []),
    };

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

  subEdges.push(...cloneEdges(edges, subNodes));
  subEdges.push(...cloneEdges(flow.edges, subNodes));

  const allNodes = uniqArray([...newNodes, ...subNodes]).map((node) => {
    if (node.isParent) {
      node.data = {};
    }
    return node;
  });

  return {
    nodes: uniqArray(allNodes),
    edges: uniqArray([...newEdges, ...subEdges]),
  };
};
