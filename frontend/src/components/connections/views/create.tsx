import { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { storage } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { ConnectionFactory } from "../factory";
import { JsonForm } from "../../../common/json-schema-form";

import RubixConnection = storage.RubixConnection;

export const CreateEditModal = (props: any) => {
  const {
    currentConnection,
    connectionSchema,
    isModalVisible,
    isLoadingForm,
    refreshList,
    onCloseModal,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentConnection);
  let factory = new ConnectionFactory();

  useEffect(() => {
    setFormData(currentConnection);
  }, [currentConnection]);

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    try {
      const res = await factory.Add();
      if (res && res.uuid) {
        openNotificationWithIcon("success", `added ${connection.name} success`);
      } else {
        openNotificationWithIcon("error", `added ${connection.name} fail`);
      }
    } catch (err) {
      openNotificationWithIcon("error", err);
      console.log(err);
    }
  };

  const editConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    factory.uuid = connection.uuid;
    await factory.Update();
  };

  const handleClose = () => {
    setFormData({} as RubixConnection);
    onCloseModal();
  };

  const handleSubmit = async (connection: RubixConnection) => {
    setConfirmLoading(true);
    if (currentConnection.uuid) {
      connection.uuid = currentConnection.uuid;
      await editConnection(connection);
    } else {
      await addConnection(connection);
    }
    setConfirmLoading(false);
    refreshList();
    handleClose();
  };

  return (
    <Modal
      title={
        currentConnection.uuid
          ? "Edit " + currentConnection.name
          : "Add New Supervisor"
      }
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      okText="Save"
      okButtonProps={{}}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      maskClosable={false} // prevent modal from closing on click outside
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          jsonSchema={connectionSchema}
        />
      </Spin>
    </Modal>
  );
};
