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
      const nodesL1 = nodes.filter(
        (node: NodeInterface) => (node.isParent && !node.parentId) || (!node.isParent && !node.parentId)
      );
      const nodesRemaining = nodes.filter((node: NodeInterface) => !!node.parentId);

      const newNodes: NodeInterfaceWithOldId[] = [];

      nodesL1.forEach((item: NodeInterface) => {
        const newNodeId = generateUuid();
        newNodes.push({ ...item, oldId: item.id, id: newNodeId, parentId: window.selectedNodeForSubFlow!!.id });
      });
      nodesRemaining.forEach((item: NodeInterface) => {
        const newNodeIdB = generateUuid();

        const newNodeL1 = newNodes.find((n) => n.oldId === item.parentId);
        const newItem = { ...item, oldId: item.id, id: newNodeIdB };
        
        if (newNodeL1) {
          newItem.parentId = newNodeL1.id;
        }

        newNodes.push(newItem);

        const childNodes = nodes.filter((i2: NodeInterface) => i2.parentId === item.id);
        
        childNodes.forEach((child) => {
          if (newNodes.findIndex((node) => node.oldId === child.id) !== -1){
            newNodes.push({ ...child, id: generateUuid(), parentId: newNodeIdB, oldId: child.id });
          }
        });
      });
      nodes = newNodes;

    } else {
      // filter parent nodes and nodes not belonging to sub flow
      // generate nodes with new id and keep old id to mapping with edge
      const newNodes: NodeInterfaceWithOldId[] = [];

      const copyAllNode = (id: string, newId: string) => {
        const childNodes = nodes.filter((node: NodeInterface) => id === node.parentId);

        childNodes.forEach((item: NodeInterface) => {
          const childNodeId = generateUuid();
          newNodes.push({ ...item, oldId: item.id, id: childNodeId, parentId: newId });

          if (item.isParent) {
            copyAllNode(item.id, childNodeId);
          }
        });
      };

      const parentNodes = nodes.filter((node: NodeInterface) => node.isParent);
      const remainingNodes = nodes.filter((node: NodeInterface) => !node.isParent && !node.parentId);

      parentNodes.forEach((parentNode: NodeInterface) => {
        const newNodeId = generateUuid();
        if (newNodes.findIndex((node) => node.oldId === parentNode.id) === -1) {
          newNodes.push({ ...parentNode, id: newNodeId, oldId: parentNode.id });
        }

        copyAllNode(parentNode.id, newNodeId);
        
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
