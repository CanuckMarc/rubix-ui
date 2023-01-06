import { useCallback } from "react";
import { useReactFlow } from "react-flow-renderer/nocss";

export const useChangeNodeData = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (key: string, value: any) => {
      // this is applied when change input at parent node
      // key = name-id => split('-') at 1 will be node id of input node
      const isForChild = key.includes('-');
      const childId = isForChild ? key.split('-')[1] : undefined;
      const childKeyName = isForChild ? key.split('-')[0] : undefined;

      instance.setNodes((nodes) =>
        nodes.map((n) => {
          if (childId && childKeyName && n.id === childId) {
            n.data = { ...n.data, [childKeyName]: value };
          }
          if (n.id === id) {
            n.data = { ...n.data, [key]: value };
          }
          return { ...n };
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
