import { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { JsonForm } from "../../../common/json-schema-form";
import { useChangeNodeProperties } from "../hooks/useChangeNodeData";

type AddStyleModalProps = {
  isModalVisible: boolean;
  node: any;
  onCloseModal: () => void;
};

export const AddStyleModal = ({
  node,
  isModalVisible,
  onCloseModal,
}: AddStyleModalProps) => {
  const handleChange = useChangeNodeProperties(node.id);
  const [formData, setFormData] = useState({} as any);
  const [schema, setSchema] = useState({});
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    fetchSchemaJson();
    setFormData({ width: node.style.width, height: node.style.height });
  }, []);

  const fetchSchemaJson = () => {
    setIsLoadingForm(true);
    const schema = {
      title: `Update Width And Height`,
      properties: {
        width: {
          type: "number",
          title: "Width",
        },
        height: {
          type: "number",
          title: "Height",
        },
      },
    };
    setSchema(schema);
    setIsLoadingForm(false);
  };

  const handleClose = () => {
    setFormData({});
    onCloseModal();
  };

  const handleSubmit = (formData: any) => {
    handleChange("style", { ...formData });
    handleClose();
  };

  return (
    <Modal
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      okText="Save"
      okButtonProps={{}}
      onCancel={handleClose}
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          jsonSchema={schema}
        />
      </Spin>
    </Modal>
  );
};
