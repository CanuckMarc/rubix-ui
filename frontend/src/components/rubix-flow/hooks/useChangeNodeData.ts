import { useCallback } from "react";
import { useReactFlow } from "reactflow";

export const useChangeNodeData = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (key: string, value: any) => {
      const nodes = instance.getNodes();
      window.saveCurrentFlowForUndo();
      instance.setNodes(
        nodes.map((n) => {
          if (n.id === id) {
            n.data = { ...n.data, [key]: value };
          }
          return { ...n };
        })
      );

      // update real node input if have
      const parentNode = nodes.find(item => item.id === id);
      if (parentNode) {
        const input = (parentNode.data.inputs || []).find((inpItem: { pin: string; }) => inpItem.pin === key);
        if (input?.nodeId) {
          const childNode = window.allFlow.nodes.find(item => item.id === input.nodeId);
          if (childNode) {
            childNode.data = { ...childNode.data, input: value };
          }
        }
      }
    },
    [instance, id]
  );
};

export const useChangeNodeProperties = (id: string) => {
  const instance = useReactFlow();

  return useCallback(
    (key: string, value: any) => {
      window.saveCurrentFlowForUndo();
      instance.setNodes((nodes => nodes.map(node => {
        if (node.id !== id) return node;
        return {
          ...node,
          [key]: value,
        };
      })));

      window.allFlow.nodes = (window.allFlow?.nodes || []).map(node => {
        if (node.id !== id) return node;
        return {
          ...node,
          [key]: value,
        };
      });
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
