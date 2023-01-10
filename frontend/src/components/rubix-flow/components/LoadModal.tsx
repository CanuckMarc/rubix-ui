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
  const { connUUID = "", hostUUID = "" } = useParams();
  const [value, setValue] = useState<string>();
  const instance = useReactFlow();

  const isRemote = !!connUUID && !!hostUUID;

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

    // filter parent nodes and nodes not belonging to sub flow
    // generate nodes with new id and keep old id to mapping with edge
    const newNodes: NodeInterfaceWithOldId[] = [];
    const nodesL1 = nodes
      .filter((node: NodeInterface) => {
        return !nodes.some((node2: NodeInterface) => node2.id === node.parentId);
      })
      .map((node: NodeInterface) => ({
        ...node,
        parentId: window.selectedNodeForSubFlow?.id || undefined,
      }));

    // nodes not included in nodesL1
    const nodesRemaining = nodes.filter(
      (node: NodeInterface) => !nodesL1.some((node2: NodeInterface) => node2.id === node.id)
    );

    const copyAllNode = (id: string, newId: string) => {
      const childNodes = nodes.filter((node: NodeInterface) => id === node.parentId);

      childNodes.forEach((childItem: NodeInterface) => {
        const childNodeId = generateUuid();
        newNodes.push({ ...childItem, oldId: childItem.id, id: childNodeId, parentId: newId });

        if (childItem.isParent) {
          copyAllNode(childItem.id, childNodeId);
        }
      });
    };

    nodesL1.forEach((item: NodeInterface) => {
      const newNodeId = generateUuid();
      newNodes.push({ ...item, oldId: item.id, id: newNodeId });

      if (item.isParent) {
        copyAllNode(item.id, newNodeId);
      }
    });

    nodesRemaining.forEach((item: NodeInterface) => {
      const isExist = newNodes.some((node: NodeInterfaceWithOldId) => node.oldId === item.id);
      if (!isExist) {
        newNodes.push({ ...item, oldId: item.id, id: generateUuid() });
      }
    });

    nodes = newNodes;

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
