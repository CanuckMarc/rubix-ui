import { useEffect, useRef, useState } from "react";
import { Edge, useReactFlow, XYPosition } from "react-flow-renderer/nocss";
import { useOnPressKey } from "../hooks/useOnPressKey";
import { NodeSpecJSON } from "../lib";
import { SettingsModal } from "./SettingsModal";
import { SetPayloadModal } from "./SetPayloadModal";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { SetNameModal } from "./Modals";
import { NodeHelpModal } from "./NodeHelpModal";

import { useStore } from "../../../App";

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
  allNodes: NodeInterface[];
  setAllNodes: Function;
  allEdges: Edge[];
  setAllEdges: Function;
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
  allNodes,
  setAllNodes,
  allEdges,
  setAllEdges
}: NodeMenuProps) => {
  const [isModalVisible, setIsModalVisible] = useState(isDoubleClick);
  const [isModalVisibleHelp, setIsModalVisibleHelp] = useState(false);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isShowPayload, setIsShowPayload] = useState(false);
  const [isShowSetName, setIsShowSetName] = useState(false);
  const [nodeType, setNodeType] = useState<NodeSpecJSON>(DEFAULT_NODE_SPEC_JSON);

  const ref = useRef(null);

  const [parentChild, setParentChild, parentChildEdge, setParentChildEdge] = useStore(
    (state) => [state.parentChild, state.setParentChild, state.parentChildEdge, state.setParentChildEdge]
  )

  // const instance = useReactFlow();

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

  const handleCloseSetNameModal = () => {
    setIsShowSetName(false);
    onClose();
  };

  const onSubFlowClick = () => {
    // console.log(node);
    // console.log('parentChild obj is: ', parentChild)
    const tempNodes:{[key:string]:[]} = parentChild
    console.log('child nodes in this subflow are: ', tempNodes[node.id])
    
    let tempInOutNodes: NodeInterface[] = [];
    const nodesInSubFlow: NodeInterface[] = tempNodes[node.id]
    nodesInSubFlow.forEach((node: NodeInterface) => {
      if (node.type === 'sub-flow/folder') {
        // subflow nodes for each folder in the current subflow
        const res = tempNodes[node.id].filter((item: NodeInterface) => {
          const name = item.type!.split('/');
          if (name[0] === 'sub-flow' && name[1] !== 'folder') {
            tempInOutNodes.push(item)
          }
        })
      }
    })
    
    
    setAllNodes([...allNodes, ...nodesInSubFlow, ...tempInOutNodes])
    // const tempEdges:{[key:string]:[]} = parentChildEdge
    // console.log('child edges in this subflow are: ', tempEdges[node.id])
    setAllEdges(parentChildEdge)





    handleAddSubFlow(node);
    onClose();

    // const res = allNodes.filter((node: NodeInterface) => {
    //   if (node.info?.nodeName === 'Bypass Dampers') {
    //     return true
    //   }
    // })
    // console.log(res)
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
    </>
  );
};
export default NodeMenu;
