import { FC, useState } from "react";
import { useReactFlow } from "react-flow-renderer/nocss";
import { behaveToFlow } from "../transformers/behaveToFlow";
import { autoLayout } from "../util/autoLayout";
import { hasPositionMetaData } from "../util/hasPositionMetaData";
import { Modal } from "./Modal";
import { GraphJSON } from "../lib";
import { handleNodesEmptySettings } from "../util/handleSettings";
import { useParams } from "react-router-dom";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { generateUuid } from "../lib/generateUuid";
import { Edge } from "react-flow-renderer";

type NodeInterfaceWithOldId = NodeInterface & { oldId?: string };

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
      nodes = nodes.map((node) => ({
        ...node,
        id: generateUuid(),
        parentId: window.selectedNodeForSubFlow!!.id,
        oldId: node.id,
        isParent: false,
      }));
    } else {
      // filter parent nodes and nodes not belonging to sub flow
      // generate nodes with new id and keep old id to mapping with edge
      const newNodes: NodeInterfaceWithOldId[] = [];
      const parentNodes = nodes.filter((node: NodeInterface) => node.isParent);
      const remainingNodes = nodes.filter((node: NodeInterface) => !node.isParent && !node.parentId);

      parentNodes.forEach((parentNode: NodeInterface) => {
        const newNodeId = generateUuid();
        const childNodes = nodes.filter((node: NodeInterface) => parentNode.id === node.parentId);
        if (childNodes.length > 0) {
          childNodes.forEach((childNode: NodeInterface) => {
            newNodes.push({ ...childNode, oldId: childNode.id, id: generateUuid(), parentId: newNodeId });
          });
        }
        newNodes.push({ ...parentNode, id: newNodeId, oldId: parentNode.id });
      });

      newNodes.push(
        ...remainingNodes.map((node: NodeInterface) => ({
          ...node,
          oldId: node.id,
          id: generateUuid(),
        }))
      );
      nodes = newNodes;
    }

    edges = edges.map((edge: Edge) => {
      const target = nodes.find((n: any) => n.oldId === edge.target);
      const source = nodes.find((n: any) => n.oldId === edge.source);
      return {
        ...edge,
        id: generateUuid(),
        target: target?.id || edge.target,
        source: source?.id || edge.source,
      };
    });

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
