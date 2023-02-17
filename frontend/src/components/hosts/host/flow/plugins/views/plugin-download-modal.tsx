import { Modal } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { FlowPluginFactory } from "../factory";

export const PluginDownloadModal = (props: any) => {
  const { isModalVisible, handleClose, pluginName, refreshList, setIsRestartFFModalVisible } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmloading] = useState(false);

  const factory = new FlowPluginFactory();

  const handleDownload = () => {
    installPlugin();
  };

  const installPlugin = async () => {
    try {
      setConfirmloading(true);
      await factory.InstallPlugin(connUUID, hostUUID, pluginName);
      refreshList();
      handleClose();
      setIsRestartFFModalVisible(true);
    } finally {
      setConfirmloading(false);
    }
  };

  return (
    <Modal
      title="Download"
      visible={isModalVisible}
      onOk={handleDownload}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Download"
      cancelText="Close"
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <div style={{ fontSize: "16px" }}>
        Selected App: <b>{pluginName}</b>
      </div>
    </Modal>
  );
};
