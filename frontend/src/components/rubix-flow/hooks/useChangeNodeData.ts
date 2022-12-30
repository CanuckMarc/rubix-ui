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
      instance.setNodes((nodes => nodes.map(node => {
        if (node.id !== id) return node;
        return {
          ...node,
          [key]: value,
        };
      })));
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
