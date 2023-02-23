import { ChangeEvent, FC, useState } from "react";
import { Radio, RadioChangeEvent, Space, Switch } from "antd";

import { Modal } from "./Modal";

export const FLOW_SETTINGS = "flow-settings";

export const getFlowSettings = () => {
  const config = JSON.parse(localStorage.getItem(FLOW_SETTINGS) || "{}");
  return {
    refreshTimeout: config?.refreshTimeout || 5,
    showSubFlowTabs: config?.showSubFlowTabs === undefined ? true : config?.showSubFlowTabs,
    showMiniMap: config?.showMiniMap === undefined ? true : config?.showMiniMap,
    showNodesTree: config?.showNodesTree === undefined ? true : config?.showNodesTree,
    showPointPallet: config?.showPointPallet === undefined ? true : config?.showPointPallet,
    showNodesPallet: config?.showNodesPallet === undefined ? true : config?.showNodesPallet,
    showCount: config?.showCount === undefined ? true : config?.showCount,
    positionMiniMap: config?.positionMiniMap === undefined ? "bottom" : config?.positionMiniMap,
  };
};

export type FlowSettings = {
  refreshTimeout: number | string;
  showMiniMap: boolean;
  showSubFlowTabs: boolean;
  showNodesTree: boolean;
  showPointPallet: boolean;
  showCount: boolean;
  showNodesPallet: boolean;
  positionMiniMap: string;
};

export type SettingsModalProps = {
  open?: boolean;
  onClose: () => void;
  settings: FlowSettings;
  onSaveSettings: (settings: FlowSettings) => void;
};

export const FlowSettingsModal: FC<SettingsModalProps> = ({ open = false, onClose, settings, onSaveSettings }) => {
  const [configs, setConfigs] = useState<FlowSettings>({
    ...settings,
  });

  const onChangeTimeout = (e: ChangeEvent<HTMLInputElement>) => {
    setConfigs({ ...configs, refreshTimeout: e.target.value });
  };

  const handleBlurValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = isNaN(+e.target.value) ? 1 : Math.max(1, Math.min(60, Number(e.target.value)));

    setConfigs({ ...configs, refreshTimeout: value });
  };

  const handleSave = () => {
    onSaveSettings(configs);
    onClose();
  };

  const handleChangePosition = (e: RadioChangeEvent) => {
    const newConfig = { ...configs, positionMiniMap: e.target.value };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  };

  const onChangeConfig = (keyConfig: keyof FlowSettings) => () => {
    const newConfig = { ...configs, [keyConfig]: !configs[keyConfig] };
    setConfigs(newConfig);
    onSaveSettings(newConfig);
  };

  const renderConfigs = (label: string, keyConfig: keyof FlowSettings) => (
    <Space direction="horizontal">
      <label className="flow-setting-modal-labels mb-0 mt-1">{label}: </label>
      <Switch checked={configs[keyConfig] as boolean} size="small" onChange={onChangeConfig(keyConfig)} />
      {configs[keyConfig] && keyConfig === "showNodesTree" && (
        <>
          <label className="flow-setting-modal-labels mb-0 mt-1">{"Show Count"}: </label>
          <Switch checked={configs["showCount"] as boolean} size="small" onChange={onChangeConfig("showCount")} />
        </>
      )}
    </Space>
  );

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
        {renderConfigs("Show Mini Map", "showMiniMap")}
        {renderConfigs("Show Points Pallet", "showPointPallet")}
        {renderConfigs("Show Nodes Tree", "showNodesTree")}
        {renderConfigs("Show Nodes Pallet", "showNodesPallet")}
        {renderConfigs("Show Sub flow tabs", "showSubFlowTabs")}
        <Space direction="horizontal">
          <label className="flow-setting-modal-labels mb-0">Mini Map Position: </label>
          <Radio.Group onChange={handleChangePosition} value={configs.positionMiniMap}>
            <Radio value="top" className="text-black">
              Top
            </Radio>
            <Radio value="bottom" className="text-black">
              Bottom
            </Radio>
          </Radio.Group>
        </Space>

        <Space direction="horizontal">
          <label className="flow-setting-modal-labels">Refresh time (second): </label>
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
