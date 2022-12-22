import { useCallback } from "react";
import { useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

export const useChangeNodeData = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (key: string, value: any) => {
      instance.setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id !== id) return n;
          return {
            ...n,
            data: {
              ...n.data,
              [key]: value,
            },
          };
        })
      );
    },
    [instance, id]
  );
};

export const useChangeNodeProperties = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (key: string, value: any) => {
      const newNodes = window.allNodes.map((node: NodeInterface) => {
        if (node.id === id) {
          node[key as keyof NodeInterface] = value;
          if (value.inputCount) {
            node.data.inputs = new Array(value.inputCount)
              .fill(() => 1)
              .map(
                (_, index) =>
                  node.data.inputs[index] || {
                    ...node.data.inputs[0],
                    pin: `in${index + 1}`,
                  }
              );
          }
        }
        return node;
      });
      instance.setNodes(newNodes);
    },
    [instance, id]
  );
};

export const useChangeNode = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (updateNode: any) => {
      instance.setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id !== id) return n;
          return {
            ...updateNode,
          };
        })
      );
    },
    [instance, id]
  );
};
