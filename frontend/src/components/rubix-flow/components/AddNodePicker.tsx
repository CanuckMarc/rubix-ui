import { useState } from "react";
import { useParams } from "react-router-dom";
import { ReactFlowInstance, XYPosition } from "reactflow";

import { generateUuid } from "../lib/generateUuid";
import { FlowFactory } from "../factory";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { isObjectEmpty } from "../../../utils/utils";
import NodePicker from "./NodePicker";
import { getNodePickerFilters } from "../util/getPickerFilters";

type Props = {
  node: NodeInterface;
  instance: ReactFlowInstance;
  selectedNodeForSubFlow?: NodeInterface;
  isAddSubNode?: boolean;
  onClose: () => void;
};

export const AddNodeComponent = ({ node, selectedNodeForSubFlow, onClose, instance, isAddSubNode = false }: Props) => {
  if (!node.isParent) return null;

  const { connUUID = "", hostUUID = "" } = useParams();
  const [nodePickerVisibility, setNodePickerVisibility] = useState(false);
  const [nodeList, setNodeList] = useState([] as any[]);
  const nodes = instance.getNodes();

  const isRemote = !!connUUID && !!hostUUID;
  const category = node.type?.split("/")[0];
  const title = isAddSubNode ? "Add sub node" : "Add node";
  const factory = new FlowFactory();

  const openModal = () => {
    if (isAddSubNode) {
      fetchNodeList();
    }
    setNodePickerVisibility(true);
  };

  const closeNodePicker = () => {
    setNodePickerVisibility(false);
    onClose();
  };

  const handleAddNode = (isParent: boolean, style: any, nodeType: string, position: XYPosition) => {
    closeNodePicker();
    const newNode = {
      id: generateUuid(),
      isParent,
      style,
      type: nodeType,
      position: {
        x: node.position.x + 10,
        y: node.position.y + Number(node.originalHeight ? node.originalHeight : node.height),
      },
      data: {},
      parentId: selectedNodeForSubFlow?.id || undefined,
    };

    //to handle sub-node's position
    if (!node.originalHeight) {
      node.originalHeight = node.height;
    }

    const index = nodes.findIndex((n) => n.id === node.id);
    const parentStyle = { minWidth: 300, height: 300 };
    nodes[index] = {
      ...node,
      style: isObjectEmpty(nodes[index]?.style || {}) ? parentStyle : nodes[index].style,
    };
    const newNodes = nodes.concat(newNode);
    instance.setNodes(newNodes);
  };

  const fetchNodeList = async () => {
    const nodeList = await factory.NodePallet(connUUID, hostUUID, isRemote, category || "");
    setNodeList(nodeList);
  };

  return (
    <>
      <div
        key="settings"
        className="cursor-pointer border-b border-gray-600 ant-menu-item ant-menu-item-only-child"
        onClick={openModal}
      >
        {title}
      </div>

      {nodePickerVisibility && (
        <NodePicker
          position={{} as XYPosition}
          filters={getNodePickerFilters(nodes, undefined)}
          onPickNode={handleAddNode}
          onClose={closeNodePicker}
          nodeList={nodeList}
        />
      )}
    </>
  );
};
