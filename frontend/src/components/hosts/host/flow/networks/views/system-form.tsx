import { Button, Form, Input, Spin, Checkbox, Select } from "antd";
import { useEffect, useState } from "react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FlowNetworkFactory } from "../factory";
import { FlowPluginFactory } from "../../plugins/factory";
import { model } from "../../../../../../../wailsjs/go/models";

import Network = model.Network;

interface SystemFormPropType {
  refreshList: Function;
  factory: FlowNetworkFactory;
  pluginFactory: FlowPluginFactory;
  isPluginInstalled: Function;
  installPlugin: Function;
  confirmInstall: boolean;
  handleWizardClose: Function;
}

export const SystemForm = (props: SystemFormPropType) => {
  const { refreshList, factory, pluginFactory, isPluginInstalled, installPlugin, confirmInstall, handleWizardClose } =
    props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isPluginInstalled("system")) {
      installPlugin("system");
    }
    form.resetFields();
  }, []);

  const onFinish = async (values: Network) => {
    try {
      setConfirmLoading(true);
      await pluginFactory.BulkEnable(["system"]);
      values.plugin_name = "system";
      if (!values.name) values.name = "System";
      if (!values.description) values.description = "System Network";
      await factory.Add(values);
      refreshList();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
      handleWizardClose();
    }
  };

  return (
    <>
      {confirmInstall ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", rowGap: "4px" }}>
          <Spin />
          <strong style={{ color: "orange" }}>Installing Plugin for System</strong>
        </div>
      ) : (
        <Form
          form={form}
          name="New System network configuration"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{
            name: "System",
            description: "System Network",
          }}
        >
          <Form.Item label="UUID" name="uuid">
            <Input />
          </Form.Item>
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Enable" name="enable" valuePropName="checked">
            <Checkbox />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={confirmLoading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
