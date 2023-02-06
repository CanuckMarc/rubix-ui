import { CSSProperties } from "react";
import { Edge, Node } from "react-flow-renderer/nocss";
import { GraphJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

export const behaveToFlow = (graph: GraphJSON): [Node[], Edge[]] => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (graph.nodes) {
    graph.nodes.forEach((nodeJson) => {
      const node: NodeInterface = {
        id: nodeJson.id,
        type: nodeJson.type || "",
        position: {
          x: nodeJson.metadata?.positionX
            ? Number(nodeJson.metadata?.positionX)
            : 0,
          y: nodeJson.metadata?.positionY
            ? Number(nodeJson.metadata?.positionY)
            : 0,
        },
        orderInput: nodeJson.inputs || {},
        data: nodeJson.data || ({} as { [key: string]: any }),
        style: nodeJson.style || ({} as CSSProperties),
        settings: nodeJson?.settings || {},
        isParent: nodeJson.isParent || false,
        parentId: nodeJson.parentId || undefined,
        info: { nodeName: nodeJson.nodeName || "" },
      };

      nodes.push(node);

      if (nodeJson.inputs) {
        if (nodeJson.inputs.links) {
          const entries = Object.entries(nodeJson.inputs.links);
          for (const [inputKey, input] of entries) {
            const { nodeId, socket, value } = input as any;
            if (nodeId !== undefined) {
              edges.push({
                id: generateUuid(),
                source: nodeId,
                sourceHandle: socket,
                target: nodeJson.id,
                targetHandle: inputKey,
              });
            }
            if (value !== undefined) {
              node.data[inputKey] = value;
            }
          }
        } else {
          const entries = Object.entries(nodeJson.inputs);
          for (const [inputKey, input] of entries) {
            if (input.links !== undefined) {
              (input.links as any).forEach((link: any) => {
                edges.push({
                  id: generateUuid(),
                  source: link.nodeId,
                  sourceHandle: link.socket,
                  target: nodeJson.id,
                  targetHandle: inputKey,
                });
              });
            }
            if (input.value !== undefined) {
              node.data[inputKey] = input.value;
            }
          }
        }
      }
    });
  }

  return [nodes, edges];
};
