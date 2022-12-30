import { FC, useState } from "react";
import { useReactFlow } from "react-flow-renderer/nocss";
import { behaveToFlow } from "../transformers/behaveToFlow";
import { autoLayout } from "../util/autoLayout";
import { hasPositionMetaData } from "../util/hasPositionMetaData";
import { Modal } from "./Modal";
import { GraphJSON } from "../lib";
import { handleNodesEmptySettings } from "../util/handleSettings";
import { useParams } from "react-router-dom";
import { handleCopyNodesAndEdges } from "../util/handleNodesAndEdges";

export type LoadModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const LoadModal: FC<LoadModalProps> = ({ open = false, onClose }) => {
  const [value, setValue] = useState<string>();
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;

  const instance = useReactFlow();

  const handleLoad = async () => {
    let graph;
    if (value !== undefined) {
      graph = JSON.parse(value) as GraphJSON;
    }

    if (graph === undefined) return;

    let [nodes, edges] = behaveToFlow(graph);

    if (hasPositionMetaData(graph) === false) {
      autoLayout(nodes, edges);
    }

    nodes = await handleNodesEmptySettings(connUUID, hostUUID, isRemote, nodes);

    /* Unselected nodes, edges */
    const oldNodes = instance.getNodes();
    const oldEdges = instance.getEdges();
    oldNodes.forEach((item) => (item.selected = false));
    oldEdges.forEach((item) => (item.selected = false));

    // add nodes into sub flow if have
    if (window.selectedNodeForSubFlow) {
      nodes = nodes.map((node) => ({ ...node, parentId: window.selectedNodeForSubFlow!!.id, isParent: false }));
    }


    // Create new uuid for nodes and edges
    const newFlow = handleCopyNodesAndEdges({ nodes, edges });
    nodes = newFlow.nodes;
    edges = newFlow.edges;

    instance.setNodes([...oldNodes, ...nodes]);
    instance.setEdges([...oldEdges, ...edges]);

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView();
    }, 100);

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
