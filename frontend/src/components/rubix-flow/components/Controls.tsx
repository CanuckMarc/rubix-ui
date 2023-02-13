import { useState } from "react";
import { ClearModal } from "./ClearModal";
import { HelpModal } from "./HelpModal";
import { LoadModal } from "./LoadModal";
import { SaveModal } from "./SaveModal";
import { useReactFlow } from "react-flow-renderer/nocss";
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
import { useCtrlPressKey } from "../hooks/useCtrlPressKey";
import { FlowSettings, FlowSettingsModal } from "./FlowSettingsModal";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { Edge } from "react-flow-renderer";

type ControlProps = {
  isChangedFlow: boolean;
  settings: FlowSettings;
  selectedNodeForSubFlow?: NodeInterface;
  deleteNodesAndEdges: (nodesDeleted: NodeInterface[], edgesDeleted: Edge[]) => void;
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
  isChangedFlow,
  selectedNodeForSubFlow,
  deleteNodesAndEdges,
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

  const handleDuplicatedNodes = (nodes?: NodeInterface[]) => {
    const nodesCopied = nodes || instance.getNodes().filter((item) => item.selected);
    const nodeIdCopied = nodesCopied.map((item) => item.id);
    const edgesCopied = instance
      .getEdges()
      .filter((item) => item.selected && nodeIdCopied.includes(item.source) && nodeIdCopied.includes(item.target));

    onCopyNodes({
      nodes: nodesCopied,
      edges: edgesCopied,
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
    copySelectNode();
    deleteSelectNode();
  });

  // Copy selected node
  const copySelectNode = () => {
    const nodesCopied = instance.getNodes().filter((node) => node.selected);
    if (nodesCopied) {
      window.nodesCopied = nodesCopied;
    }
  };

  useCtrlPressKey("KeyC", copySelectNode);

  useCtrlPressKey("KeyV", () => {
    const activeElement = document.activeElement;
    if (
      !["input", "textarea"].includes(activeElement?.tagName?.toLowerCase() || "") &&
      window.nodesCopied &&
      window.nodesCopied.length > 0
    ) {
      handleDuplicatedNodes(window.nodesCopied.map((node) => ({ ...node, parentId: selectedNodeForSubFlow?.id })));
    }
    window.nodesCopied = [];
  });

  const onConnectionBuilder = () => {
    handleConnectionBuilderFlow(selectedNodeForSubFlow!!);
  };

  const renderIconBtn = (title: string, Icon: any, onClick: () => void, id = "") => {
    return (
      <div id={id} className="cursor-pointer border-r bg-white hover:bg-gray-100" title={title} onClick={onClick}>
        <Icon className="p-2 text-gray-700 align-middle" />
      </div>
    );
  };

  return (
    <>
      <div className="absolute top-4 right-4 bg-white z-10 flex black--text">
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
        {renderIconBtn("Download", VerticalAlignBottomOutlined, onHandelSaveFlow)}
      </div>
      <LoadModal
        open={loadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        handleLoadNodesAndEdges={handleLoadNodesAndEdges}
      />
      <SaveModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ClearModal open={clearModalOpen} onClose={() => setClearModalOpen(false)} onClear={onClearAllNodes} />
      <FlowSettingsModal
        settings={settings}
        open={settingRefreshModalOpen}
        onClose={() => setSettingRefreshModalOpen(false)}
        onSaveSettings={onSaveSettings}
      />
    </>
  );
};

export default Controls;
