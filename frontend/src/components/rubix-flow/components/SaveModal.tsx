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

  const edges = (window.allEdges|| []);
  const nodes = (window.allNodes || []);
  
  const flow = useMemo(() => flowToBehave(nodes, edges), [nodes, edges]);

  const handleCopy = () => {
    ref.current?.select();
    document.execCommand("copy");
    ref.current?.blur();
    setCopied(true);
    setInterval(() => {
      setCopied(false);
    }, 1000);
  };

  const handleNodeRender = () => {
    const selectedNodes: NodeJSON[] = flowToBehave(
      nodes.filter((item: NodeInterface) => item.selected),
      edges
    ).nodes;    
    const newNodes: NodeJSON[] = selectedNodes.length === 0 ? flow.nodes : selectedNodes;
    setNodeRender(JSON.stringify({ nodes: newNodes }, null, 2));
  };

  useEffect(() => {
    handleNodeRender();
  }, [flow]);

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
        className="border border-gray-300 p-2"
        defaultValue={nodeRender}
        style={{ height: "50vh", width: "500px" }}
      />
    </Modal>
  );
};
