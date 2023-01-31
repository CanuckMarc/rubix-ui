import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Edge, useEdges, useNodes } from "react-flow-renderer/nocss";
import { NodeJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { flowToBehave } from "../transformers/flowToBehave";
import { Modal } from "./Modal";

export type SaveModalProps = {
  open?: boolean;
  selectedNodeForSubFlow?: NodeInterface;
  onClose: () => void;
};

export const SaveModal: FC<SaveModalProps> = ({ open = false, selectedNodeForSubFlow, onClose }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [nodeRender, setNodeRender] = useState("");
  const nodes = useNodes();

  const handleCopy = () => {
    if (ref.current) {
      ref.current.select();
      document.execCommand("copy");
      ref.current.blur();
      setCopied(true);
      setInterval(() => {
        setCopied(false);
      }, 1000);
    }
  };

  const findAllNodes = (id: string) => {
    const nodesChild: NodeInterface[] = window.allFlow.nodes.filter((item: NodeInterface) => item.parentId === id);
    const allNodes: NodeInterface[] = [];

    nodesChild.forEach((item) => {
      allNodes.push(item);
      if (item.isParent) {
        allNodes.push(...findAllNodes(item.id));
      }
    });

    return allNodes;
  };

  const handleNodeRender = () => {
    let selectedNodes: NodeInterface[] = nodes.filter((item: NodeInterface) => item.selected);
    let isInSubFlow = false;
    const allNodes: NodeInterface[] = [];

    if (selectedNodes.length === 0 && selectedNodeForSubFlow) {
      selectedNodes = [selectedNodeForSubFlow];
      isInSubFlow = true;
    }

    selectedNodes.forEach((item) => {
      if (isInSubFlow && item.id !== selectedNodeForSubFlow!!.id) {
        allNodes.push(item);
      }
      if (!isInSubFlow) {
        allNodes.push(item);
      }
      if (item.isParent) {
        allNodes.push(...findAllNodes(item.id));
      }
    });

    const finalNodes: NodeInterface[] = isInSubFlow ? allNodes : allNodes.length > 0 ? allNodes : nodes;
    const newNodes: NodeJSON[] = flowToBehave(finalNodes, window.allFlow.edges).nodes;
    setNodeRender(JSON.stringify({ nodes: newNodes }, null, 2));
  };

  useEffect(() => {
    if (open) {
      handleNodeRender();
    } else {
      setNodeRender("");
    }
  }, [open, selectedNodeForSubFlow]);

  return (
    <Modal
      title="Save Graph"
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: copied ? "Copied" : "Copy", onClick: handleCopy },
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        ref={ref}
        value={nodeRender}
        readOnly
        className="border border-gray-300 p-2"
        style={{ height: "50vh", width: "500px" }}
      />
    </Modal>
  );
};
