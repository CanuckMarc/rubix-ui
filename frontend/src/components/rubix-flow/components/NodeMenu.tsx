import { useEffect, useRef, useState } from "react";
import { Edge, XYPosition } from "react-flow-renderer/nocss";
import { useOnPressKey } from "../hooks/useOnPressKey";
import { NodeSpecJSON } from "../lib";
import { SettingsModal } from "./SettingsModal";
import { SetPayloadModal } from "./SetPayloadModal";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { SetNameModal } from "./Modals";
import { SettingNode } from "./SettingNode";
import { NodeHelpModal } from "./NodeHelpModal";

type NodeMenuProps = {
  position: XYPosition;
  node: NodeInterface;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  isDoubleClick: boolean;
  onClose: () => void;
  selectedNodeForSubFlow?: NodeInterface;
  deleteNode: (_nodesDeleted: NodeInterface[], _edgesDeleted: Edge[]) => void;
  duplicateNode: (_copied: { nodes: NodeInterface[]; edges: any }) => void;
  deleteAllInputOrOutputOfParentNode: (isInputs: boolean, nodeId: string) => void;
  deleteAllInputOrOutputConnectionsOfNode: (isInputs: boolean, nodeId: string) => void;
  handleAddSubFlow: (node: NodeInterface) => void;
  isOpenFromNodeTree: boolean;
};

export const DEFAULT_NODE_SPEC_JSON: NodeSpecJSON = {
  allowSettings: false,
  type: "",
  category: "None",
};

const NodeMenu = ({
  position,
  node,
  nodesSpec,
  isDoubleClick,
  onClose,
  deleteNode,
  duplicateNode,
  handleAddSubFlow,
  deleteAllInputOrOutputOfParentNode,
  deleteAllInputOrOutputConnectionsOfNode,
  isOpenFromNodeTree = false,
}: NodeMenuProps) => {
  const [isModalVisible, setIsModalVisible] = useState(isDoubleClick);
  const [isModalVisibleHelp, setIsModalVisibleHelp] = useState(false);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isShowPayload, setIsShowPayload] = useState(false);
  const [isShowSetName, setIsShowSetName] = useState(false);
  const [isShowSetNode, setIsShowSetNode] = useState(false);
  const [nodeType, setNodeType] = useState<NodeSpecJSON>(DEFAULT_NODE_SPEC_JSON);

  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !(ref.current as HTMLDivElement).contains(event.target)) {
        if (!isShowSetting && !isShowSetName && !isShowPayload && !isModalVisibleHelp) {
          onClose();
        }
      }
    }
    if (isOpenFromNodeTree) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpenFromNodeTree, isShowSetting, isShowSetName, isShowPayload, isModalVisibleHelp]);

  useOnPressKey("Escape", onClose);

  const openModal = () => {
    setIsModalVisibleHelp(true);
  };

  const closeModal = () => {
    setIsModalVisibleHelp(false);
    onClose();
  };

  const openSettingsModal = () => {
    setIsModalVisible(true);
  };

  const handleTogglePayload = () => {
    setIsShowPayload(!isShowPayload);
  };

  const handleToggleSetName = () => {
    setIsShowSetName(!isShowSetName);
  };
  const handleToggleSetNode = () => {
    setIsShowSetNode(!isShowSetNode);
  };
  const handleCloseSetNodeModal = () => {
    setIsShowSetNode(false);
    onClose();
  };

  const handleCloseSetNameModal = () => {
    setIsShowSetName(false);
    onClose();
  };

  const onSubFlowClick = () => {
    handleAddSubFlow(node);
    onClose();
  };

  const exportSubFlowClick = () => {
    window.selectedNodeForExport = node;
    document.getElementById("exportButton")?.click();
    onClose();
  };

  const handleNodeDeletion = () => {
    deleteNode([node], []);
    onClose();
  };

  const handleNodeDuplication = () => {
    duplicateNode({ nodes: [node], edges: [] });
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
          ref={ref}
          className={`node-picker node-menu ${
            isOpenFromNodeTree ? "fixed" : "absolute"
          } z-10 text-white border rounded border-gray-500 ant-menu ant-menu-root ant-menu-inline ant-menu-dark`}
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
              className="cursor-pointer border-b border-gray-600 ant-menu-item"
              onClick={handleTogglePayload}
            >
              Set Payload
            </div>
          )}
          {isShowSetting && (
            <div
              key="settings"
              className="cursor-pointer border-b border-gray-600 ant-menu-item"
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
          <div
            key="Sett Node"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleToggleSetNode}
          >
            Settings Node
          </div>
          {node.isParent && (
            <>
              <div
                key="Sub flow"
                className="cursor-pointer border-b border-gray-600 ant-menu-item"
                onClick={onSubFlowClick}
              >
                Open Sub Flow
              </div>
              <div
                key="Export Sub flow"
                className="cursor-pointer border-b border-gray-600 ant-menu-item"
                onClick={exportSubFlowClick}
              >
                Export Sub Flow
              </div>
              <div
                key="Delete all input"
                className="cursor-pointer border-b border-gray-600 ant-menu-item"
                onClick={deleteAllInputs(true)}
              >
                Delete all folder inputs
              </div>
              <div
                key="Delete all output"
                className="cursor-pointer border-b border-gray-600 ant-menu-item"
                onClick={deleteAllInputs(false)}
              >
                Delete all folder outputs
              </div>
            </>
          )}
          <div
            key="Delete all input connection"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={deleteAllInputConnection(true)}
          >
            Delete all input connections
          </div>
          <div
            key="Delete all output connection"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={deleteAllInputConnection(false)}
          >
            Delete all output connections
          </div>
          <div
            key="Delete node"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleNodeDeletion}
          >
            Delete node
          </div>
          <div
            key="Duplicate node"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleNodeDuplication}
          >
            Duplicate node
          </div>
          <div key="help" className="cursor-pointer ant-menu-item" onClick={openModal}>
            Help
          </div>
        </div>
      )}
      <NodeHelpModal node={node} open={isModalVisibleHelp} onClose={closeModal} />
      {isShowSetting && <SettingsModal node={node} isModalVisible={isModalVisible} onCloseModal={onClose} />}

      {nodeType.allowPayload && (
        <SetPayloadModal node={node} nodeType={nodeType} open={isShowPayload} onClose={() => setIsShowPayload(false)} />
      )}
      <SetNameModal node={node} open={isShowSetName} onClose={handleCloseSetNameModal} />
      <SettingNode node={node} open={isShowSetNode} onClose={handleCloseSetNodeModal}/>
    </>
  );
};
export default NodeMenu;
