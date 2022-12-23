import { useState } from "react";
import { Modal, Spin } from "antd";
import { FlowFactory } from "../../rubix-flow/factory";
import { db } from "../../../../wailsjs/go/models";
import Connection = db.Connection;
import { JsonForm } from "../../../common/json-schema-form";
import { useParams } from "react-router-dom";

export const CreateModal = (props: any) => {
  const { isModalVisible, schema, onCloseModal, refreshList } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as Connection);
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;

  const factory = new FlowFactory();

  const add = async (connection: Connection) => {
    await factory.AddWiresConnection(connUUID, hostUUID, isRemote, connection);
  };

  const handleClose = () => {
    setFormData({} as Connection);
    onCloseModal();
  };

  const handleSubmit = async (item: Connection) => {
    setConfirmLoading(true);
    await add(item);
    refreshList();
    setConfirmLoading(false);
    handleClose();
  };

  return (
    <Modal
      title="Add New"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <JsonForm formData={formData} jsonSchema={schema} setFormData={setFormData} handleSubmit={handleSubmit} />
    </Modal>
  );
};
