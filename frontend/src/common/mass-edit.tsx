import { Button, Modal } from "antd";
import { HighlightOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { JsonForm } from "./json-schema-form";
import { SELECTED_ITEMS } from "../components/rubix-flow/use-nodes-spec";
import { openNotificationWithIcon } from "../utils/utils";

const MassEdit = (props: any) => {
  const { fullSchema, title, keyName, handleOk } = props;
  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getDefaultInputValue = (type: string) => {
    let defaultValue = null;
    switch (type) {
      case "string":
        defaultValue = "";
        break;
      case "boolean":
        defaultValue = false;
        break;
      default:
        defaultValue = null;
    }
    return defaultValue;
  };

  const openModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedItems = JSON.parse("" + localStorage.getItem(SELECTED_ITEMS)) || [];
    if (selectedItems.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    const schema = { properties: { [keyName]: fullSchema[keyName] } };
    const formData = { [keyName]: fullSchema[keyName].default ?? getDefaultInputValue(fullSchema[keyName].type) };
    setSchema(schema);
    setFormData(formData);
    setIsModalVisible(true);
    setConfirmLoading(false);
  };

  const closeModal = async () => {
    setIsModalVisible(false);
    setFormData({});
  };

  const handleSubmit = async (formData: any) => {
    try {
      setConfirmLoading(true);
      await handleOk(formData);
      closeModal();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between" style={{ alignItems: "center" }}>
        {title}
        <Button icon={<HighlightOutlined />} onClick={openModal} className="ml-2 mr-3" />
      </div>

      <Modal
        title="Mass edit"
        className="text-start"
        visible={isModalVisible}
        onCancel={closeModal}
        onOk={() => handleSubmit(formData)}
        confirmLoading={confirmLoading}
        maskClosable={false}
      >
        <JsonForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} jsonSchema={schema} />
      </Modal>
    </>
  );
};

export default MassEdit;
