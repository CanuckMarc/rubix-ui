import { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { JsonForm } from "../../../common/json-schema-form";
import { FlowFactory } from "../factory";
import { useChangeNodeProprerties } from "../hooks/useChangeNodeData";
import { useNodes } from "react-flow-renderer";
import { NodeJSON } from "../lib";

type SettingsModalProps = {
  isModalVisible: boolean;
  node: any;
  onCloseModal: () => void;
};

export const SettingsModal = ({
  node,
  isModalVisible,
  onCloseModal,
}: SettingsModalProps) => {
  const handleChange = useChangeNodeProprerties(node.id);
  const [settings, setSettings] = useState({} as any);
  const [formData, setFormData] = useState({});
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const factory = new FlowFactory();

  useEffect(() => {
    fetchSchemaJson();
  }, []);

  const fetchSchemaJson = async () => {
    setIsLoadingForm(true);
    const type = node.type.split("/")[1];
    const res = (await factory.NodeSchema(type)) || {};
    setSettings(res);
    setIsLoadingForm(false);

    // Fetch Setting on backend
    handleSetFormData(res);
  };

  const handleSetFormData = async (_settings: any) => {
    try {
      const _formData = {} as any;
      const _node = (await factory.NodeValue(node.id)) || {};
      const _properties = Object.entries(_settings.schema.properties || {});
      

      for (const [key, value] of _properties) {
        if (_node.settings && key in _node.settings) {
          _formData[key] = _node.settings[key];
        }
      }

      setFormData(_formData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    setFormData({});
    onCloseModal();
  };

  const handleSubmit = async (formData: any) => {
    handleChange("settings", formData);
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
          jsonSchema={settings.schema}
          uiSchema={settings.uiSchema}
        />
      </Spin>
    </Modal>
  );
};
