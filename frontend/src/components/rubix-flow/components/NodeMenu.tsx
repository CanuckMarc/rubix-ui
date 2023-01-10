import { useEffect, useState } from "react";
import { useReactFlow, XYPosition } from "react-flow-renderer/nocss";
import { useOnPressKey } from "../hooks/useOnPressKey";
import { NodeSpecJSON } from "../lib";
import { useNodesSpec } from "../use-nodes-spec";
import { SettingsModal } from "./SettingsModal";
import { SetPayloadModal } from "./SetPayloadModal";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { SetNameModal } from "./Modals";
import { AddNodeComponent } from "./AddNodePicker";
import { HelpComponent } from "./NodeHelp";

type NodeMenuProps = {
  position: XYPosition;
  node: NodeInterface;
  isDoubleClick: boolean;
  onClose: () => void;
  selectedNodeForSubFlow?: NodeInterface;
  deleteAllInputOrOutputOfParentNode: (isInputs: boolean, nodeId: string) => void;
  deleteAllInputOrOutputConnectionsOfNode: (isInputs: boolean, nodeId: string) => void;
  handleAddSubFlow: (node: NodeInterface) => void;
};

export const DEFAULT_NODE_SPEC_JSON: NodeSpecJSON = {
  allowSettings: false,
  type: "",
  category: "None",
};

const NodeMenu = ({
  position,
  node,
  isDoubleClick,
  onClose,
  handleAddSubFlow,
  deleteAllInputOrOutputOfParentNode,
  deleteAllInputOrOutputConnectionsOfNode,
  selectedNodeForSubFlow,
}: NodeMenuProps) => {
  const [isModalVisible, setIsModalVisible] = useState(isDoubleClick);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isShowPayload, setIsShowPayload] = useState(false);
  const [isShowSetName, setIsShowSetName] = useState(false);
  const [nodeType, setNodeType] = useState<NodeSpecJSON>(DEFAULT_NODE_SPEC_JSON);

  const [nodesSpec] = useNodesSpec();
  const instance = useReactFlow();

  useOnPressKey("Escape", onClose);

  const openSettingsModal = () => {
    setIsModalVisible(true);
  };

  const handleTogglePayload = () => {
    setIsShowPayload(!isShowPayload);
  };

  const handleToggleSetName = () => {
    setIsShowSetName(!isShowSetName);
  };

  const handleCloseSetNameModal = () => {
    setIsShowSetName(false);
    onClose();
  };

  const onSubFlowClick = () => {
    handleAddSubFlow(node);
    onClose();
  };

  const deleteAllInputs =
    (isInputs = false) =>
    () => {
      deleteAllInputOrOutputOfParentNode(isInputs, node.id);
      onClose();
    };

  const deleteAllInputConnection =
    (isInputs = false) =>
    () => {
      deleteAllInputOrOutputConnectionsOfNode(isInputs, node.id);
      onClose();
    };

  useEffect(() => {
    const nodeType = (nodesSpec as NodeSpecJSON[]).find((item) => item.type === node.type) || DEFAULT_NODE_SPEC_JSON;
    setNodeType(nodeType);

    const isAllowSetting = nodeType?.allowSettings || false;

    if (isDoubleClick && !isAllowSetting) {
      onClose();
    }

    setIsShowSetting(isAllowSetting);
  }, [node, nodesSpec]);

  return (
    <>
      {!isDoubleClick && (
        <div
          className="node-picker node-menu absolute z-10 text-white border rounded border-gray-500 ant-menu ant-menu-root ant-menu-inline ant-menu-dark"
          style={{
            top: position.y,
            left: position.x,
            width: "auto",
            borderRight: "1px solid #303030",
            minWidth: 120,
          }}
        >
          <div className="bg-gray-500 mt-0 ant-menu-item">-</div>
          {/* <AddNodeComponent
            node={node}
            onClose={onClose}
            instance={instance}
            selectedNodeForSubFlow={selectedNodeForSubFlow}
          /> */}
          {nodeType.allowPayload && (
            <div
              key="Set Payload"
              className="cursor-pointer border-b border-gray-600  ant-menu-item"
              onClick={handleTogglePayload}
            >
              Set Payload
            </div>
          )}
          {isShowSetting && (
            <div
              key="settings"
              className="cursor-pointer border-b border-gray-600  ant-menu-item"
              onClick={openSettingsModal}
            >
              Settings
            </div>
          )}
          <div
            key="Set Name"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleToggleSetName}
          >
            Set Name
          </div>
          {node.isParent && (
            <>
              <div
                key="Sub flow"
                className="cursor-pointer border-b border-gray-600  ant-menu-item"
                onClick={onSubFlowClick}
              >
                Open Sub Flow
              </div>
              <div
                key="Delete all input"
                className="cursor-pointer border-b border-gray-600  ant-menu-item"
                onClick={deleteAllInputs(true)}
              >
                Delete all folder inputs
              </div>
              <div
                key="Delete all output"
                className="cursor-pointer border-b border-gray-600  ant-menu-item"
                onClick={deleteAllInputs(false)}
              >
                Delete all folder outputs
              </div>
            </>
          )}
          <div
            key="Delete all input connection"
            className="cursor-pointer border-b border-gray-600  ant-menu-item"
            onClick={deleteAllInputConnection(true)}
          >
            Delete all input connections
          </div>
          <div
            key="Delete all output connection"
            className="cursor-pointer border-b border-gray-600  ant-menu-item"
            onClick={deleteAllInputConnection(false)}
          >
            Delete all output connections
          </div>
          <HelpComponent node={node} onClose={onClose} />
        </div>
      )}
      {isShowSetting && <SettingsModal node={node} isModalVisible={isModalVisible} onCloseModal={onClose} />}

      {nodeType.allowPayload && (
        <SetPayloadModal node={node} nodeType={nodeType} open={isShowPayload} onClose={() => setIsShowPayload(false)} />
      )}
      <SetNameModal node={node} open={isShowSetName} onClose={handleCloseSetNameModal} />
    </>
  );
};
export default NodeMenu;
