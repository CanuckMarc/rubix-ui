import { useEffect, useState } from "react";
import { useReactFlow, XYPosition } from "react-flow-renderer/nocss";
import { isObjectEmpty } from "../../../utils/utils";
import { useOnPressKey } from "../hooks/useOnPressKey";
import { NodeJSON, NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { getNodePickerFilters } from "../util/getPickerFilters";
import { useNodesSpec } from "../use-nodes-spec";
import { SettingsModal } from "./SettingsModal";
import NodePicker from "./NodePicker";
import {
  deviantMousePositionX,
  deviantMousePositionY,
} from "../util/autoLayout";
import { FlowFactory } from "../factory";
import { useParams } from "react-router-dom";

type NodeMenuProps = {
  position: XYPosition;
  node: { type: string };
  isDoubleClick: boolean;
  onClose: () => void;
};

const AddNodeComponent = ({ node, onClose, instance }: any) => {
  if (!node.isParent) return null;

  const nodes = instance.getNodes();
  const [nodePickerVisibility, setNodePickerVisibility] = useState(false);

  const openModal = () => {
    setNodePickerVisibility(true);
  };

  const closeNodePicker = () => {
    setNodePickerVisibility(false);
    onClose();
  };

  const handleAddNode = (
    isParent: boolean,
    style: any,
    nodeType: string,
    position: XYPosition
  ) => {
    closeNodePicker();

    const newNode = {
      id: generateUuid(),
      isParent,
      style,
      type: nodeType,
      position: {
        x: node.position.x + 10,
        y:
          node.position.y +
          (node.originalHeight ? node.originalHeight : node.height),
      },
      data: {},
      parentId: node.id,
    };

    //to handle sub-node's position
    if (!node.originalHeight) {
      node.originalHeight = node.height;
    }

    const index = nodes.findIndex((n: NodeJSON) => n.id === node.id);
    const parentStyle = { width: 300, height: 300 };
    nodes[index] = {
      ...node,
      style: isObjectEmpty(nodes[index].style)
        ? parentStyle
        : nodes[index].style,
    };
    const newNodes = nodes.concat(newNode);
    instance.setNodes(newNodes);
  };

  return (
    <>
      <div
        key="settings"
        className="p-2 cursor-pointer border-b border-gray-600"
        onClick={openModal}
      >
        Add node
      </div>

      {nodePickerVisibility && (
        <NodePicker
          position={{} as XYPosition}
          filters={getNodePickerFilters(nodes, undefined)}
          onPickNode={handleAddNode}
          onClose={closeNodePicker}
        />
      )}
    </>
  );
};

const AddSubNodeComponent = ({ node, onClose, instance }: any) => {
  if (!node.isParent) return null;

  const [nodePickerVisibility, setNodePickerVisibility] = useState(false);
  const [nodeList, setNodeList] = useState([] as any[]);
  const nodes = instance.getNodes();
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const category = node.type.split("/")[0];

  const factory = new FlowFactory();

  const openModal = () => {
    setNodePickerVisibility(true);
    fetchNodeList();
  };

  const closeNodePicker = () => {
    setNodePickerVisibility(false);
    onClose();
  };

  const handleAddNode = (
    isParent: boolean,
    style: any,
    nodeType: string,
    position: XYPosition
  ) => {
    closeNodePicker();

    const newNode = {
      id: generateUuid(),
      isParent,
      style,
      type: nodeType,
      position: {
        x: node.position.x + 10,
        y:
          node.position.y +
          (node.originalHeight ? node.originalHeight : node.height),
      },
      data: {},
      parentId: node.id,
    };

    //to handle sub-node's position
    if (!node.originalHeight) {
      node.originalHeight = node.height;
    }

    const index = nodes.findIndex((n: NodeJSON) => n.id === node.id);
    const parentStyle = { width: 300, height: 300 };
    nodes[index] = {
      ...node,
      style: isObjectEmpty(nodes[index].style)
        ? parentStyle
        : nodes[index].style,
    };
    const newNodes = nodes.concat(newNode);
    instance.setNodes(newNodes);
  };

  const fetchNodeList = async () => {
    const nodeList = await factory.NodePallet(
      connUUID,
      hostUUID,
      isRemote,
      category
    );
    setNodeList(nodeList);
  };

  return (
    <>
      <div
        key="settings"
        className="p-2 cursor-pointer border-b border-gray-600"
        onClick={openModal}
      >
        Add sub node
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

// const AddStyleComponent = ({ node, onClose }: any) => {
//   if (isObjectEmpty(node.style)) return null;

//   const [isModalVisible, setIsModalVisible] = useState(false);

//   const openModal = () => {
//     setIsModalVisible(true);
//   };

//   const closeModal = () => {
//     setIsModalVisible(false);
//     onClose();
//   };

//   return (
//     <>
//       <div
//         key="settings"
//         className="p-2 cursor-pointer border-b border-gray-600"
//         onClick={openModal}
//       >
//         Add style
//       </div>

//       <AddStyleModal
//         node={node}
//         isModalVisible={isModalVisible}
//         onCloseModal={closeModal}
//       />
//     </>
//   );
// };

const NodeMenu = ({
  position,
  node,
  isDoubleClick,
  onClose,
}: NodeMenuProps) => {
  const [isModalVisible, setIsModalVisible] = useState(isDoubleClick);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [nodesSpec] = useNodesSpec();
  const instance = useReactFlow();

  const mousePosition = {
    x: position.x - deviantMousePositionX,
    y: position.y - deviantMousePositionY,
  };

  useOnPressKey("Escape", onClose);

  const openSettingsModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    const nodeType = (nodesSpec as NodeSpecJSON[]).find(
      (item) => item.type === node.type
    );
    const isAllowSetting = nodeType?.allowSettings || false;

    if (isDoubleClick && !isAllowSetting) {
      onClose();
    }

    setIsShowSetting(isAllowSetting);
  }, [nodesSpec, node]);

  return (
    <>
      {!isDoubleClick && (
        <div
          className="node-picker absolute z-10 text-white bg-gray-800 border rounded border-gray-500"
          style={{ top: mousePosition.y, left: mousePosition.x }}
        >
          <div className="bg-gray-500 p-2">Node Menu</div>
          <AddSubNodeComponent
            node={node}
            onClose={onClose}
            instance={instance}
          />
          <AddNodeComponent node={node} onClose={onClose} instance={instance} />
          <div className="overflow-y-scroll" style={{ maxHeight: "23rem" }}>
            {isShowSetting && (
              <div
                key="settings"
                className="p-2 cursor-pointer border-b border-gray-600"
                onClick={openSettingsModal}
              >
                Settings
              </div>
            )}
          </div>
        </div>
      )}
      {isShowSetting && (
        <SettingsModal
          node={node}
          isModalVisible={isModalVisible}
          onCloseModal={onClose}
        />
      )}
    </>
  );
};
export default NodeMenu;
