import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useEdges, useNodes } from "react-flow-renderer/nocss";
import { NodeJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { flowToBehave } from "../transformers/flowToBehave";
import { Modal } from "./Modal";

export type SaveModalProps = { open?: boolean; onClose: () => void };

export const SaveModal: FC<SaveModalProps> = ({ open = false, onClose }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [nodeRender, setNodeRender] = useState("");

  const edges = useEdges();
  const nodes = useNodes();

  const flow = useMemo(() => flowToBehave(nodes, edges), [nodes, edges]);

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
    const nodesChild: NodeInterface[] = nodes.filter((item: NodeInterface) => item.parentId === id);
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
    let isExcludeParentNode = false;
    const allNodes: NodeInterface[] = [];

    if (selectedNodes.length === 0 && window.selectedNodeForSubFlow) {
      selectedNodes = [window.selectedNodeForSubFlow];
      isExcludeParentNode = true;
    }

    selectedNodes.forEach((item) => {
      if (isExcludeParentNode && item.id !== window.selectedNodeForSubFlow!!.id) {
        allNodes.push(item);
      }
      if (!isExcludeParentNode) {
        allNodes.push(item);
      }
      if (item.isParent) {
        allNodes.push(...findAllNodes(item.id));
      }
    });

    const newNodes: NodeJSON[] = allNodes.length > 0 ? flowToBehave(allNodes, edges).nodes : flow.nodes;
    setNodeRender(JSON.stringify({ nodes: newNodes }, null, 2));
  };

  useEffect(() => {
    if (open) {
      handleNodeRender();
    } else {
      setNodeRender("");
    }
  }, [flow, open]);

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
