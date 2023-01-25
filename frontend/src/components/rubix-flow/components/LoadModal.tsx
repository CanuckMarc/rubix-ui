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
import { useStore } from "../../../App";

type NodeInterfaceWithOldId = NodeInterface & { oldId?: string };

export type LoadModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const LoadModal: FC<LoadModalProps> = ({ open = false, onClose }) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [value, setValue] = useState<string>();
  const instance = useReactFlow();

  const [parentChild, setParentChild, parentChildEdge, setParentChildEdge] = useStore(
    (state) => [state.parentChild, state.setParentChild, state.parentChildEdge, state.setParentChildEdge]
  )

  const isRemote = !!connUUID && !!hostUUID;

  const handleLoad = async () => {
    let graph;
    if (value !== undefined) {
      graph = JSON.parse(value) as GraphJSON;
    }

    // console.log(graph)
    
    if (graph === undefined) return;
    
    let [nodes, edges] = behaveToFlow(graph);
    // console.log(nodes)
    // console.log(edges)

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
      // .filter((node: NodeInterface) => {
      //   return !nodes.some((node2: NodeInterface) => node2.id === node.parentId);
      // })
      .filter((node: NodeInterface) => {
        return node.parentId == undefined
      })
      .map((node: NodeInterface) => ({
        ...node,
        parentId: window.selectedNodeForSubFlow?.id || undefined,
      }));

    console.log(nodesL1)

    // nodes not included in nodesL1
    const nodesRemaining = nodes.filter(
      (node: NodeInterface) => !nodesL1.some((node2: NodeInterface) => node2.id === node.id)
    );

    console.log(nodesRemaining)

    let parentChild:any = {}

    const copyAllNode = (id: string, newId: string) => {
      parentChild[newId] = []
      const childNodes = nodes.filter((node: NodeInterface) => id === node.parentId);


      childNodes.forEach((childItem: NodeInterface) => {
        const childNodeId = generateUuid();
        newNodes.push({ ...childItem, oldId: childItem.id, id: childNodeId, parentId: newId });
        parentChild[newId].push({ ...childItem, oldId: childItem.id, id: childNodeId, parentId: newId })

        if (childItem.isParent) {
          copyAllNode(childItem.id, childNodeId);
        }
      });
    };

    let newNodesL1: any = []
    nodesL1.forEach((item: NodeInterface) => {
      const newNodeId = generateUuid();
      newNodes.push({ ...item, oldId: item.id, id: newNodeId });
      newNodesL1.push({ ...item, oldId: item.id, id: newNodeId });

      if (item.isParent) {
        copyAllNode(item.id, newNodeId);
      }
    });

    // console.log('parentChild obj is: ', parentChild)
    setParentChild(parentChild)

    // since the previous function has made copies of all parent and child nodes, the following function
    // search for any nodes in the remaining nodes that are not parent nor child to any other nodes
    // and add them to array newNodes
    nodesRemaining.forEach((item: NodeInterface) => {
      // return true if any newNodes' old id is the same as remaning nodes' id
      const isExist = newNodes.some((node: NodeInterfaceWithOldId) => node.oldId === item.id);
      if (!isExist) {
        newNodes.push({ ...item, oldId: item.id, id: generateUuid() });
      }
    });

    nodes = newNodes;
    console.log(newNodes);

    edges = edges.map((edge: Edge) => {
      // find target/source node if its old id equals the target id stored on an edge
      const target = nodes.find((n: any) => n.oldId === edge.target);
      const source = nodes.find((n: any) => n.oldId === edge.source);
      // map the old edge target and source id to the new id assigned during the copy operation above
      // if the target node exists in newNodes, use the old one otherwise
      // all edges are given new id
      return {
        ...edge,
        id: generateUuid(),
        target: target?.id || edge.target,
        source: source?.id || edge.source,
      };
    });

    // let newEdgesL1: Edge[] = []
    // newNodesL1.forEach((node: NodeInterface) => {
    //   edges.forEach(edge => {
    //     if (node.id === edge.target || node.id === edge.source) {
    //       newEdgesL1.push(edge)
    //     }
    //   })
    // });

    // let parentChildEdge: any = {}
    // for (const parentNodeId in parentChild) {
    //   parentChildEdge[parentNodeId] = []
    //   parentChild[parentNodeId].forEach((childNode: NodeInterface) => {
    //     edges.forEach(edge => {
    //       if (childNode.id === edge.target || childNode.id === edge.source) {
    //         parentChildEdge[parentNodeId].push(edge)
    //       }
    //     })
    //   });
    // }

    // console.log('parentChildEdge is: ', parentChildEdge)
    setParentChildEdge(edges)
    

    // instance.setNodes([...oldNodes, ...nodes]);
    instance.setEdges([...oldEdges, ...edges]);

    instance.setNodes([...oldNodes, ...newNodesL1]);
    // instance.setEdges([...oldEdges, ...newEdgesL1]);

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
