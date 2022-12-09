import { useEffect, useState } from "react";
import { ClearModal } from "./ClearModal";
import { HelpModal } from "./HelpModal";
import { LoadModal } from "./LoadModal";
import { SaveModal } from "./SaveModal";
import { flowToBehave } from "../transformers/flowToBehave";
import { useReactFlow } from "react-flow-renderer/nocss";
import {
  QuestionCircleOutlined,
  DownloadOutlined,
  RestOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FlowFactory } from "../factory";
import { useCtrlPressKey } from "../hooks/useCtrlPressKey";
import { useParams } from "react-router-dom";
import { handleNodesEmptySettings } from "../util/handleSettings";
import { FlowSettings, FlowSettingsModal } from "./FlowSettingsModal";
import { ChangeParentNodeModal } from "./Modals";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type ControlProps = {
  onDeleteEdges: (nodes: any, edges: any) => void;
  onCopyNodes: (nodes: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRefreshValues: () => void;
  settings: FlowSettings;
  onSaveSettings: (settings: FlowSettings) => void;
  onOpenNodePicker: (node: NodeInterface) => void;
};

const Controls = ({
  onDeleteEdges,
  onCopyNodes,
  onUndo,
  onRedo,
  onRefreshValues,
  settings,
  onSaveSettings,
  onOpenNodePicker,
}: ControlProps) => {
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [settingRefreshModalOpen, setSettingRefreshModalOpen] = useState(false);
  const [isWarningAddSubModal, setWarningAddSubModal] = useState(false);
  const [nodeSelected, setNodeSelected] = useState<NodeInterface[]>([]);

  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const instance = useReactFlow();

  const factory = new FlowFactory();

  const download = async () => {
    const nodes = instance.getNodes();
    const edges = instance.getEdges();
    const graphJson = flowToBehave(nodes, edges);
    await factory.DownloadFlow(connUUID, hostUUID, isRemote, graphJson, true);

    const newNodes = await handleNodesEmptySettings(
      connUUID,
      hostUUID,
      isRemote,
      instance.getNodes()
    );
    instance.setNodes(newNodes);
  };

  const getNodeSelected = () => {
    const nodes = instance.getNodes() as NodeInterface[];
    return nodes.filter((item) => item.selected && item.isParent);
  };

  const hdlOpenAddSub = () => {
    const newNodeSelected = getNodeSelected();
    if (newNodeSelected.length === 1) {
      onOpenNodePicker(newNodeSelected[0]);
    } else {
      setWarningAddSubModal(true);
    }
  };
  const hdlCloseAddSub = () => setWarningAddSubModal(false);

  /* Ctrl + e (key): Save Graph */
  useCtrlPressKey("KeyE", () => {
    setSaveModalOpen(true);
  });

  /* Ctrl + i (key): Load Graph */
  useCtrlPressKey("KeyI", () => {
    setLoadModalOpen(true);
  });

  /* Ctrl + d (key): Delete items selected
  useCtrlPressKey("KeyD", () => {
    const _nodes = instance.getNodes();
    const _edges = instance.getEdges();

    const newNodes = _nodes.filter((item) => !item.selected);
    const newEdges = _edges.filter((item) => !item.selected);

    instance.setNodes(newNodes);
    instance.setEdges(newEdges);

    onDeleteEdges(newNodes, newEdges);
  }); */

  /* Ctrl + a (key): Select all items */
  useCtrlPressKey("KeyA", () => {
    const _nodes = instance.getNodes();
    const _edges = instance.getEdges();

    const newNodes = _nodes.map((item) => {
      item.selected = true;
      return item;
    });
    const newEdges = _edges.map((item) => {
      item.selected = true;
      return item;
    });

    instance.setNodes(newNodes);
    instance.setEdges(newEdges);
  });

  /* Ctrl + C (key): Copy nodes
  useCtrlPressKey("KeyC", () => {
    const nodesCopied = instance.getNodes().filter((item) => item.selected);
    const nodeIdCopied = nodesCopied.map((item) => item.id);
    const edgesCopied = instance
      .getEdges()
      .filter(
        (item) =>
          item.selected &&
          nodeIdCopied.includes(item.source) &&
          nodeIdCopied.includes(item.target)
      );

    setCopied({
      nodes: nodesCopied,
      edges: edgesCopied,
    });
  }); */

  /* Ctrl + D (key): Paste nodes */
  useCtrlPressKey("KeyD", () => {
    const nodesCopied = instance.getNodes().filter((item) => item.selected);
    const nodeIdCopied = nodesCopied.map((item) => item.id);
    const edgesCopied = instance
      .getEdges()
      .filter(
        (item) =>
          item.selected &&
          nodeIdCopied.includes(item.source) &&
          nodeIdCopied.includes(item.target)
      );
    onCopyNodes({
      nodes: nodesCopied,
      edges: edgesCopied,
    });
  });

  /* Ctrl + Z (key): Undo */
  useCtrlPressKey("KeyZ", () => {
    onUndo();
  });

  /* Ctrl + Y (key): Redo */
  useCtrlPressKey("KeyY", () => {
    onRedo();
  });

  /* Ctrl + S (key): Download/deploy flow */
  useCtrlPressKey("KeyS", () => {
    download();
  });

  /* Ctrl + X (key): Refresh node values */
  useCtrlPressKey("KeyX", () => {
    onRefreshValues();
  });

  useEffect(() => {
    const newNodeSelected = getNodeSelected();
    if (newNodeSelected.length !== nodeSelected.length) {
      setNodeSelected(newNodeSelected);
    }
  }, [instance.getNodes()]);

  return (
    <>
      <div className="absolute top-4 right-4 bg-white z-10 flex black--text">
        {nodeSelected.length > 0 && (
          <div
            className="cursor-pointer border-r bg-white hover:bg-gray-100"
            title="Add sub node"
            onClick={hdlOpenAddSub}
          >
            <PlusOutlined className="p-2 text-gray-700 align-middle" />
          </div>
        )}
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Settings refresh value"
          onClick={() => setSettingRefreshModalOpen(true)}
        >
          <SettingOutlined className="p-2 text-gray-700 align-middle" />
        </div>
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Help"
          onClick={() => setHelpModalOpen(true)}
        >
          <QuestionCircleOutlined className="p-2 text-gray-700 align-middle" />
        </div>
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Load"
          onClick={() => setLoadModalOpen(true)}
        >
          <UploadOutlined className="p-2 text-gray-700 align-middle" />
        </div>
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Save"
          onClick={() => setSaveModalOpen(true)}
        >
          <DownloadOutlined className="p-2 text-gray-700 align-middle" />
        </div>
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Clear"
          onClick={() => setClearModalOpen(true)}
        >
          <RestOutlined className="p-2 text-gray-700 align-middle" />
        </div>
        <div
          className="cursor-pointer border-r bg-white hover:bg-gray-100"
          title="Run"
          onClick={() => download()}
        >
          <PlayCircleOutlined className="p-2 text-gray-700 align-middle" />
        </div>
      </div>
      <LoadModal open={loadModalOpen} onClose={() => setLoadModalOpen(false)} />
      <SaveModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ClearModal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
      />
      <FlowSettingsModal
        settings={settings}
        open={settingRefreshModalOpen}
        onClose={() => setSettingRefreshModalOpen(false)}
        onSaveSettings={onSaveSettings}
      />
      <ChangeParentNodeModal
        open={isWarningAddSubModal}
        onClose={hdlCloseAddSub}
      />
    </>
  );
};

export default Controls;
