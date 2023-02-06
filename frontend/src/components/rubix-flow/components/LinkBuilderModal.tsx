import { FC, memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";

import { NodeInterface, OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { Modal } from "./Modal";
import { NodeSpecJSON } from "../lib";
import { isInputFlow, isOutputFlow } from "./Node";
import { generateUuid } from "../lib/generateUuid";
import {
  generateNodeFromBuilder,
  NodeSpecJSONWithName,
  NodeWithExpose,
  OutputNodeValueTypeWithExpose,
  RenderNodeBuilder,
} from "./ConnectionBuilderModal";

type LinkBuilderModalProps = {
  parentNode?: NodeInterface;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  open?: boolean;
  onClose: () => void;
};

export const LinkBuilderModal: FC<LinkBuilderModalProps> = memo(({ parentNode, open = false, nodesSpec, onClose }) => {
  const flowInstance = useReactFlow();
  const { connUUID = "", hostUUID = "" } = useParams();
  const nodes = useNodes() as NodeWithExpose[];
  const edges = useEdges();
  const [nodesBuilder, setNodesBuilder] = useState<NodeWithExpose[]>([]);

  const getFlowInputOutput = (flowItems: NodeSpecJSON[], item: OutputNodeValueTypeWithExpose, node: NodeInterface) => {
    const result = flowItems.find((flowItem: NodeSpecJSON) => flowItem.type.includes(item.dataType));

    return {
      ...result,
      node,
      pin: item.pin,
      nodeName: [item.nodeName, item.isUseNodeName ? item.pin : ""].join(" "),
    };
  };

  const isInputLink = (type: string) => {
    const newType = type.split("/")?.[1];
    return ["link-input-number", "link-input-string", "link-input-boolean"].includes(newType);
  };

  const isOutputLink = (type: string) => {
    const newType = type.split("/")?.[1];
    return ["link-output-number", "link-output-string", "link-output-boolean"].includes(newType);
  };

  const handleSave = () => {
    const inputsLink = (nodesSpec as NodeSpecJSON[]).filter((n) => isInputLink(n.type));
    const outputsLink = (nodesSpec as NodeSpecJSON[]).filter((n) => isOutputLink(n.type));

    if (nodesBuilder.length > 0) {
      const allNodes: NodeInterface[] = [];
      const allEdges: Edge[] = [];
      const parentId = parentNode?.id || null;

      nodesBuilder.forEach((node) => {
        let newNodesInput = node.data.inputs
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => getFlowInputOutput(outputsLink, item, node));

        let newNodesOutput = node.data.out
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => getFlowInputOutput(inputsLink, item, node));

        newNodesInput = newNodesInput
          .map((item: NodeSpecJSONWithName, idx: number) =>
            item.type
              ? generateNodeFromBuilder(connUUID, hostUUID, nodesSpec as NodeSpecJSON[], parentId, item, idx)
              : null
          )
          .filter(Boolean);
        newNodesOutput = newNodesOutput
          .map((item: NodeSpecJSONWithName, idx: number) =>
            item.type
              ? generateNodeFromBuilder(connUUID, hostUUID, nodesSpec as NodeSpecJSON[], parentId, item, idx, true)
              : null
          )
          .filter(Boolean)
          .map((node: NodeInterface & { pin: string }) => {
            const topic = node.info!!.nodeName!!.split(" ");
            if (topic.length && topic[topic.length - 1] === node.pin) {
              topic.pop();
            }
            node.data.topic = topic.join(" ");
            return node;
          });
        allNodes.push(...[...newNodesInput, ...newNodesOutput]);

        newNodesInput.forEach((nodeItem: NodeInterface & { pin: string }) => {
          const newEdge = {
            id: generateUuid(),
            source: nodeItem.id,
            sourceHandle: "out",
            target: node.id,
            targetHandle: nodeItem.pin,
          };
          allEdges.push(newEdge);
        });

        newNodesOutput.forEach((nodeItem: NodeInterface & { pin: string }) => {
          const pinTarget = nodeItem.data?.inputs?.find((item: { name: string }) => item.name !== "topic");
          const newEdge = {
            id: generateUuid(),
            source: node.id,
            sourceHandle: nodeItem.pin,
            target: nodeItem.id,
            targetHandle: pinTarget?.name || "in",
          };
          allEdges.push(newEdge);
        });
      });

      if (allNodes.length > 0) {
        setTimeout(() => {
          window.allFlow = {
            nodes: [...window.allFlow.nodes, ...allNodes],
            edges: [...window.allFlow.edges, ...allEdges],
          };
          flowInstance.addNodes(allNodes);
          flowInstance.addEdges(allEdges);
          setTimeout(() => {
            flowInstance.fitView();
          }, 50);
        }, 50);
      }
    }
    onClose();
  };

  useEffect(() => {
    if (open) {
      const childNodes = nodes.filter((nodeItem: NodeWithExpose) => {
        if (parentNode) {
          return nodeItem.parentId === parentNode.id;
        }
        return !nodeItem.parentId;
      });
      const childNodesSelected = childNodes.filter((item) => item.selected);

      const newNodeBuilder = (childNodesSelected.length > 0 ? childNodesSelected : childNodes).filter(
        (nodeItem: NodeWithExpose) => {
          const connectionCount = (nodeItem.data.inputs || []).length + (nodeItem.data.out || []).length;
          const edgeWithNode = edges.filter(
            (edge) => edge.target === nodeItem.id || edge.source === nodeItem.id
          ).length;
          return (
            !nodeItem.isParent &&
            !isInputFlow(nodeItem.type!!) &&
            !isOutputFlow(nodeItem.type!!) &&
            connectionCount !== edgeWithNode
          );
        }
      );

      setNodesBuilder(
        newNodeBuilder.map((node) => ({
          ...node,
          data: {
            ...node.data,
            inputs: (node.data.inputs || []).map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
              nodeName: "",
            })),
            out: (node.data.out || []).map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
              nodeName: "",
            })),
          },
        }))
      );
    }
  }, [open]);

  return (
    <Modal
      title="Link Builder"
      actions={[
        { label: "Close", onClick: onClose },
        { label: "Generate nodes", onClick: handleSave },
      ]}
      open={open}
      onClose={onClose}
    >
      <div className="my-3 px-4 py-3">
        {nodesBuilder.length > 0 ? (
          nodesBuilder.map((node, index) => (
            <RenderNodeBuilder
              key={node.id}
              node={node}
              index={index}
              edges={edges}
              nodesBuilder={nodesBuilder}
              setNodesBuilder={setNodesBuilder}
            />
          ))
        ) : (
          <p>All node connected</p>
        )}
      </div>
    </Modal>
  );
});
