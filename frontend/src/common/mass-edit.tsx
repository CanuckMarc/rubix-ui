import { Button, Modal } from "antd";
import { HighlightOutlined } from "@ant-design/icons";
import { useState } from "react";
import { JsonForm } from "./json-schema-form";

const MassEdit = (props: any) => {
  const { handleOk, fullSchema, keyName } = props;
  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const schema = { properties: { [keyName]: fullSchema[keyName] } };
    const formData = { [keyName]: fullSchema[keyName].default || null };
    setSchema(schema);
    setFormData(formData);
    setIsModalVisible(true);
  };

  const closeModal = async () => {
    setIsModalVisible(false);
    setFormData({});
  };

  const handleSubmit = async (formData: any) => {
    setConfirmLoading(true);
    await handleOk(formData);
    setConfirmLoading(false);
    closeModal();
  };

  return (
    <>
      <div className="flex justify-between" style={{ alignItems: "center" }}>
        {keyName.replaceAll("_", " ")}
        <Button
          icon={<HighlightOutlined />}
          onClick={openModal}
          className="ml-2 mr-3"
        />
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
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          jsonSchema={schema}
        />
      </Modal>
    </>
  );
};

export default MassEdit;
