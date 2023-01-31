import { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { storage } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { ConnectionFactory } from "../factory";
import { JsonForm } from "../../../common/json-schema-form";
import RubixConnection = storage.RubixConnection;
import { hasError } from "../../../utils/response";

export const CreateEditModal = (props: any) => {
  const { currentConnection, connectionSchema, isModalVisible, isLoadingForm, refreshList, onCloseModal } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentConnection);
  const [validationError, setValidationError] = useState(true);
  const factory = new ConnectionFactory();

  useEffect(() => {
    setFormData(currentConnection);
  }, [currentConnection]);

  useEffect(() => {
    if (currentConnection.uuid) {
      setValidationError(true);
    } else {
      setValidationError(false);
    }
  }, [currentConnection.uuid]);

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    return await factory.Add();
  };

  const editConnection = async (connection: RubixConnection) => {
    factory.uuid = connection.uuid;
    return await factory.Update();
  };

  const handleClose = () => {
    setFormData({} as RubixConnection);
    onCloseModal();
  };

  const handleSubmit = async (connection: RubixConnection) => {
    if (validationError) {
      return;
    }
    setConfirmLoading(true);
    factory.this = connection;
    let res: any;
    let operation: string;
    if (currentConnection.uuid) {
      connection.uuid = currentConnection.uuid;
      res = await editConnection(connection);
      operation = "updated";
    } else {
      res = await addConnection(connection);
      operation = "added";
    }
    if (!hasError(res)) {
      openNotificationWithIcon("success", `${operation} ${connection.name} success`);
      handleClose();
    } else {
      openNotificationWithIcon("error", res.msg);
    }
    refreshList();
    setConfirmLoading(false);
  };

  return (
    <Modal
      title={currentConnection.uuid ? "Edit " + currentConnection.name : "Add New Supervisor"}
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      okText="Save"
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okButtonProps={{ disabled: validationError }}
      maskClosable={false} // prevent modal from closing on click outside
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          jsonSchema={connectionSchema}
          setValidationError={setValidationError}
        />
      </Spin>
    </Modal>
  );
};
