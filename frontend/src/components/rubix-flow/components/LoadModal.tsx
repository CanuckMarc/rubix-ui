import { FC, useState } from "react";
import { Edge } from "reactflow";

import { behaveToFlow } from "../transformers/behaveToFlow";
import { autoLayout } from "../util/autoLayout";
import { hasPositionMetaData } from "../util/hasPositionMetaData";
import { Modal } from "./Modal";
import { GraphJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type LoadModalProps = {
  open?: boolean;
  onClose: () => void;
  handleLoadNodesAndEdges: (nodes: NodeInterface[], edges: Edge[]) => void;
};

export const LoadModal: FC<LoadModalProps> = ({ open = false, onClose, handleLoadNodesAndEdges }) => {
  const [value, setValue] = useState<string>();

  const handleLoad = async () => {
    let graph;
    if (value !== undefined) {
      graph = JSON.parse(value) as GraphJSON;
    }

    if (graph === undefined) return;

    const [nodes, edges] = behaveToFlow(graph);

    if (hasPositionMetaData(graph) === false) {
      autoLayout(nodes, edges);
    }

    handleLoadNodesAndEdges(nodes, edges);
    handleClose();
  };

  const handleClose = () => {
    setValue(undefined);
    onClose();
  };

  return (
    <Modal
      title="Load Graph"
      actions={[
        { label: "Cancel", onClick: handleClose },
        { label: "Load", onClick: handleLoad },
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        autoFocus
        className="border border-gray-300 p-2 align-top"
        placeholder="Paste JSON here"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        style={{ height: "50vh", width: "500px" }}
      />
    </Modal>
  );
};
