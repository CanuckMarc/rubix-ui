import { ChangeEvent, FC, useState } from "react";
import { Radio, RadioChangeEvent, Space, Switch } from "antd";

import { Modal } from "./Modal";

export const FLOW_SETTINGS = "flow-settings";

export const getFlowSettings = () => {
  const config = JSON.parse(localStorage.getItem(FLOW_SETTINGS) || "{}");
  return {
    refreshTimeout: config?.refreshTimeout || 5,
    showMiniMap: config?.showMiniMap === undefined ? true : config?.showMiniMap,
    showNodesTree: config?.showNodesTree === undefined ? true : config?.showNodesTree,
    showNodesPallet: config?.showNodesPallet === undefined ? true : config?.showNodesPallet,
    positionMiniMap:
      config?.positionMiniMap === undefined
        ? "bottom"
        : config?.positionMiniMap,
  };
};

export type FlowSettings = {
  refreshTimeout: number | string;
  showMiniMap: boolean;
  showNodesTree: boolean;
  showNodesPallet: boolean;
  positionMiniMap: string;
};

export type SettingsModalProps = {
  open?: boolean;
  onClose: () => void;
  settings: FlowSettings;
  onSaveSettings: (settings: FlowSettings) => void;
};

export const FlowSettingsModal: FC<SettingsModalProps> = ({
  open = false,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [configs, setConfigs] = useState<FlowSettings>({
    ...settings,
  });

  const onChangeTimeout = (e: ChangeEvent<HTMLInputElement>) => {
    setConfigs({ ...configs, refreshTimeout: e.target.value });
  };

  const handleBlurValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = isNaN(+e.target.value)
      ? 1
      : Math.max(1, Math.min(60, Number(e.target.value)));

    setConfigs({ ...configs, refreshTimeout: value });
  };

  const onChangeShowMiniMap = () => {
    const newConfig = { ...configs, showMiniMap: !configs.showMiniMap };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  };

  const onChangeShowNodesTree = () => {
    const newConfig = { ...configs, showNodesTree: !configs.showNodesTree };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  }

  const onChangeShowNodesPallet = () => {
    const newConfig = { ...configs, showNodesPallet: !configs.showNodesPallet };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  }

  const handleSave = () => {
    onSaveSettings(configs);
    onClose();
  };

  const handleChangePosition = (e: RadioChangeEvent) => {
    const newConfig = { ...configs, positionMiniMap: e.target.value };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  };

  return (
    <Modal
      title="Settings"
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Save", onClick: handleSave },
      ]}
      open={open}
      onClose={onClose}
    >
      <Space direction="vertical" align="start">
          <Space direction='horizontal'>
            <label id="flow-setting-modal-labels">Show Mini Map: </label>
            <Switch
              checked={configs.showMiniMap}
              size="small"
              onChange={onChangeShowMiniMap}
            />
          </Space>

          <Space direction='horizontal'>
            <label id="flow-setting-modal-labels">Show Nodes Tree: </label>
            <Switch
              checked={configs.showNodesTree}
              size="small"
              onChange={onChangeShowNodesTree}
            />
          </Space>

          <Space direction='horizontal'>
            <label id="flow-setting-modal-labels">Show Nodes Pallet: </label>
            <Switch
              checked={configs.showNodesPallet}
              size="small"
              onChange={onChangeShowNodesPallet}
            />
          </Space>

          <Space direction='horizontal'>
            <label id="flow-setting-modal-labels">Mini Map Position: </label>
            <Radio.Group
              onChange={handleChangePosition}
              value={configs.positionMiniMap}
            >
              <Radio value="top" className="text-black">
                Top
              </Radio>
              <Radio value="bottom" className="text-black">
                Bottom
              </Radio>
            </Radio.Group>
          </Space>

          <Space direction='horizontal'>
            <label id="flow-setting-modal-labels">Refresh time (second): </label>
            <input
              type="number"
              className="border border-gray-300 p-2"
              value={configs.refreshTimeout}
              onChange={onChangeTimeout}
              onBlur={handleBlurValue}
            />
          </Space>
      </Space>
    </Modal>
  );
};
