import { useState } from "react";
import { useReactFlow, Edge } from "reactflow";
import {
  QuestionCircleOutlined,
  DownloadOutlined,
  RestOutlined,
  UploadOutlined,
  VerticalAlignBottomOutlined,
  SettingOutlined,
  LinkOutlined,
  BuildOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";

import { useCtrlPressKey } from "../hooks/useCtrlPressKey";
import { FlowSettings, FlowSettingsModal } from "./FlowSettingsModal";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { ClearModal } from "./ClearModal";
import { HelpModal } from "./HelpModal";
import { LoadModal } from "./LoadModal";
import { SaveModal } from "./SaveModal";

type ControlProps = {
  isChangedFlow: boolean;
  isSaving: boolean;
  settings: FlowSettings;
  selectedNodeForSubFlow?: NodeInterface;
  deleteNodesAndEdges: (nodesDeleted: NodeInterface[], edgesDeleted: Edge[]) => void;
  deleteNodesAndEdgesCtrX: (nodesDeleted: NodeInterface[], edgesDeleted: Edge[]) => void;
  onCopyNodes: (data: { nodes: NodeInterface[]; edges: Edge[] }) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearAllNodes: () => void;
  onHandelSaveFlow: () => void;
  onBackToMain: () => void;
  onCloseSubFlow: () => void;
  onSaveSettings: (settings: FlowSettings) => void;
  handleConnectionBuilderFlow: (node: NodeInterface) => void;
  onLinkBuilder: () => void;
  handleLoadNodesAndEdges: (nodes: NodeInterface[], edges: Edge[]) => void;
};

const Controls = ({
  settings,
  isSaving,
  isChangedFlow,
  selectedNodeForSubFlow,
  deleteNodesAndEdges,
  deleteNodesAndEdgesCtrX,
  onCopyNodes,
  onUndo,
  onRedo,
  onSaveSettings,
  handleConnectionBuilderFlow,
  onLinkBuilder,
  onClearAllNodes,
  onCloseSubFlow,
  onBackToMain,
  onHandelSaveFlow,
  handleLoadNodesAndEdges,
}: ControlProps) => {
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [copyNodesC, setCopyNodesC] = useState(false);
  const [newNodes, setNewNode] = useState({} as any);
  const [settingRefreshModalOpen, setSettingRefreshModalOpen] = useState(false);
  const instance = useReactFlow();

  /* Ctrl + e (key): Save Graph */
  useCtrlPressKey("KeyE", () => {
    setSaveModalOpen(true);
  });

  /* Ctrl + i (key): Load Graph */
  useCtrlPressKey("KeyI", () => {
    setLoadModalOpen(true);
  });

  // Delete selected node
  const deleteSelectNode = () => {
    const _nodes = instance.getNodes();
    const _edges = instance.getEdges();

    const nodesDeleted = _nodes.filter((item) => item.selected);
    const edgesDeleted = _edges.filter((item) => item.selected);

    deleteNodesAndEdges(nodesDeleted, edgesDeleted);
  };
  const deleteSelectNodeCtrX = () => {
    const _nodes = instance.getNodes();
    const _edges = instance.getEdges();

    const nodesDeleted = _nodes.filter((item) => item.selected);
    const edgesDeleted = _edges.filter((item) => item.selected);

    deleteNodesAndEdgesCtrX(nodesDeleted, edgesDeleted);
  };

  /* Ctrl + Delete (key): Delete items selected  */
  useCtrlPressKey("Backspace", deleteSelectNode);

  /* Ctrl + a (key): Select all items */
  useCtrlPressKey("KeyA", () => {
    const _nodes = instance.getNodes();
    const _edges = instance.getEdges();

    const newNodes = _nodes.map((item: NodeInterface) => {
      item.selected = window.selectedNodeForSubFlow
        ? item.parentId === window.selectedNodeForSubFlow.id
        : !item.parentId;
      return item;
    });
    const newEdges = _edges.map((item) => {
      item.selected = newNodes.some((node) => [item.target, item.source].includes(node.id));
      return item;
    });

    instance.setNodes(newNodes);
    instance.setEdges(newEdges);
  });

  const handleDuplicatedNodes = (nodes?: NodeInterface[], edges?: Edge[]) => {
    const nodesCopied = nodes || instance.getNodes().filter((item) => item.selected);

    const nodeIdCopied = nodesCopied.map((item) => item.id);
    const edgesCopied =
      edges ||
      instance
        .getEdges()
        .filter((item) => item.selected && nodeIdCopied.includes(item.source) && nodeIdCopied.includes(item.target));

    onCopyNodes({
      nodes: nodesCopied,
      edges: copyNodesC ? edgesCopied : newNodes.edges,
    });
  };

  /* Ctrl + D (key): Paste nodes */
  useCtrlPressKey("KeyD", () => handleDuplicatedNodes());

  /* Ctrl + Z (key): Undo */
  useCtrlPressKey("KeyZ", onUndo);

  /* Ctrl + Y (key): Redo */
  useCtrlPressKey("KeyY", onRedo);

  /* Ctrl + S (key): Download/deploy flow */
  useCtrlPressKey("KeyS", onHandelSaveFlow);

  /* Ctrl + X (key): Refresh node values */
  useCtrlPressKey("KeyX", () => {
    setCopyNodesC(false);
    copySelectNode();
    deleteSelectNodeCtrX();
  });

  // Copy selected node
  const copySelectNode = () => {
    const nodesCopied = instance.getNodes().filter((node) => node.selected);
    const edgesCopied = instance.getEdges().filter((edge) => edge.selected);
    if (nodesCopied) {
      window.nodesCopied = nodesCopied;
      window.edgesCopied = edgesCopied;
    }
    const newNodes= {
      nodes: nodesCopied,
      edges: instance.getEdges(),
    };  
    setNewNode(newNodes);   
  };
  
  useCtrlPressKey("KeyC", () => {
    setCopyNodesC(true);
    copySelectNode();
  });

  useCtrlPressKey("KeyV", () => {
    const activeElement = document.activeElement;
    if (
      !["input", "textarea"].includes(activeElement?.tagName?.toLowerCase() || "") &&
      window.nodesCopied &&
      window.nodesCopied.length > 0
    ) {
      const nodes = window.nodesCopied.map((node) => ({ ...node, parentId: selectedNodeForSubFlow?.id }));
      const edges = window.edgesCopied;
      handleDuplicatedNodes(nodes, edges);
    }
    window.nodesCopied = [];
  });

  const onConnectionBuilder = () => {
    handleConnectionBuilderFlow(selectedNodeForSubFlow!!);
  };

  const renderIconBtn = (title: string, Icon: any, onClick: () => void, id = "") => {
    return (
      <div
        id={id}
        className="cursor-pointer border-r bg-white hover:bg-gray-100"
        title={title}
        onClick={onClick}
        style={{ height: 24 }}
      >
        <Icon className="p-2 text-gray-700 align-middle" />
      </div>
    );
  };

  return (
    <>
      <div className="absolute top-4 right-4 bg-white z-10 flex black--text">
        {isSaving && (
          <div className=" border-r bg-white " title="Saving..." style={{ height: 24 }}>
            <Spin size="small" className="pt-1 px-2" />
          </div>
        )}
        {isChangedFlow && renderIconBtn("Sync flow", SyncOutlined, onHandelSaveFlow)}
        {renderIconBtn("Link Builder", LinkOutlined, onLinkBuilder)}
        {!!selectedNodeForSubFlow && (
          <>
            {renderIconBtn("Connection Builder", BuildOutlined, onConnectionBuilder)}
            {renderIconBtn("Back to Main", RollbackOutlined, onBackToMain)}
            {renderIconBtn("Close sub flow", CloseCircleOutlined, onCloseSubFlow)}
          </>
        )}
        {renderIconBtn("Settings", SettingOutlined, () => setSettingRefreshModalOpen(true))}
        {renderIconBtn("Help", QuestionCircleOutlined, () => setHelpModalOpen(true))}
        {renderIconBtn("Import", DownloadOutlined, () => setLoadModalOpen(true))}
        {renderIconBtn("Export", UploadOutlined, () => setSaveModalOpen(true), "exportButton")}
        {renderIconBtn("Wipe", RestOutlined, () => setClearModalOpen(true))}
      </div>
      {loadModalOpen && (
        <LoadModal open onClose={() => setLoadModalOpen(false)} handleLoadNodesAndEdges={handleLoadNodesAndEdges} />
      )}
      {saveModalOpen && <SaveModal open onClose={() => setSaveModalOpen(false)} />}
      {helpModalOpen && <HelpModal open onClose={() => setHelpModalOpen(false)} />}
      {clearModalOpen && <ClearModal open onClose={() => setClearModalOpen(false)} onClear={onClearAllNodes} />}
      {settingRefreshModalOpen && (
        <FlowSettingsModal
          settings={settings}
          open
          onClose={() => setSettingRefreshModalOpen(false)}
          onSaveSettings={onSaveSettings}
        />
      )}
    </>
  );
};

export default Controls;
