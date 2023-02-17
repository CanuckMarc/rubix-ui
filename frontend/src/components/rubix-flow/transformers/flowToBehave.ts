import { Edge, Node } from "react-flow-renderer/nocss";
import { isObjectEmpty } from "../../../utils/utils";
import { GraphJSON, NodeJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

const isNullish = (value: any): value is null | undefined =>
  value === undefined || value === null;

export const flowToBehave = (nodes: Node[], edges: Edge[]): GraphJSON => {
  const graph: GraphJSON = { nodes: [] };

  nodes.forEach((node: NodeInterface) => {
    if (node.type === undefined) {
      return;
    }

    const newInput = node.data.inputs.reduce(
      (obj: { [key: string]: any }, item: { value: string; pin: string }) => {
        return {
          ...obj,
          [item.pin]: {
            ...item,
            value:
              node.data[item.pin] !== undefined
                ? node.data[item.pin]
                : item.value,
          },
        };
      },
      {}
    );

    const behaveNode: NodeJSON = {
      id: node.id,
      type: node.type,
      isParent: node.isParent,
      metadata: {
        positionX: String(node.position.x),
        positionY: String(node.position.y),
      },
      settings: node.settings,
      nodeName: node.info?.nodeName,
      inputs: newInput,
    };

    if (node.parentId) behaveNode.parentId = node.parentId;

    if (node.style && !isObjectEmpty(node.style)) behaveNode.style = node.style;

    edges
      .filter((edge) => edge.target === node.id)
      .forEach((edge) => {
        if (behaveNode.inputs === undefined) {
          behaveNode.inputs = {};
        }
        if (isNullish(edge.targetHandle)) return;
        if (isNullish(edge.sourceHandle)) return;

        behaveNode.inputs[edge.targetHandle] = {
          links: [{ nodeId: edge.source, socket: edge.sourceHandle }],
        };
      });

    // TODO filter out any orphan nodes at this point, to avoid errors further down inside behave-graph

    graph.nodes.push(behaveNode);
  });

  return graph;
};
