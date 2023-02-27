import { Button, Form, Input, Spin, Checkbox, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FlowNetworkFactory } from "../factory";
import { FlowPluginFactory } from "../../plugins/factory";

interface BacnetFormPropType {
  connUUID: string;
  hostUUID: string;
  refreshList: Function;
  factory: FlowNetworkFactory;
  pluginFactory: FlowPluginFactory;
  isPluginInstalled: Function;
  installPlugin: Function;
  confirmInstall: boolean;
  handleWizardClose: Function;
}

interface InterfaceOptionType {
  value: string;
  label: string;
}

export const BacnetForm = (props: BacnetFormPropType) => {
  const {
    connUUID,
    hostUUID,
    refreshList,
    factory,
    pluginFactory,
    isPluginInstalled,
    installPlugin,
    confirmInstall,
    handleWizardClose,
  } = props;
  const [showOptions, setShowOptions] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [interfaceNames, setInterfaceNames] = useState<InterfaceOptionType[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isPluginInstalled("bacnetmaster")) {
      installPlugin("bacnetmaster");
    }
    form.resetFields();
  }, []);

  useEffect(() => {
    showOptions && fetchSchema("bacnetmaster");
  }, [showOptions]);

  const fetchSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await factory.Schema(connUUID, hostUUID, pluginName);
    if (res) {
      let interfaceNameArray: InterfaceOptionType[] = [];
      res.network_interface?.enum?.forEach((item: string) => {
        const obj = {
          value: item,
          label: item,
        };
        if (!interfaceNameArray.some((item: InterfaceOptionType) => item.value === obj.value)) {
          interfaceNameArray.push(obj);
        }
      });
      setInterfaceNames(interfaceNameArray);
    }
    setIsLoadingForm(false);
  };

  const onFinish = async (values: any) => {
    try {
      setConfirmLoading(true);
      await pluginFactory.BulkEnable(["bacnetmaster"]);
      values.plugin_name = "bacnetmaster";
      if (!values.name) values.name = "BACnet";
      if (!values.description) values.description = "BACnet Network";
      if (!values.network_interface) values.network_interface = "eth0";
      if (!values.port) values.port = 47808;
      if (!values.fast_poll_rate) values.fast_poll_rate = 1;
      if (!values.normal_poll_rate) values.normal_poll_rate = 20;
      if (!values.slow_poll_rate) values.slow_poll_rate = 120;
      await factory.Add(values);
      refreshList();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
      handleWizardClose();
    }
  };

  const onCheckboxChange = (e: CheckboxChangeEvent) => {
    setShowOptions(e.target.checked);
  };

  return (
    <>
      {confirmInstall ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", rowGap: "4px" }}>
          <Spin />
          <strong style={{ color: "orange" }}>Installing Plugin for BACnet</strong>
        </div>
      ) : (
        <Spin spinning={isLoadingForm}>
          <Form
            form={form}
            name="New BACnet network configuration"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 15 }}
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{
              name: "BACnet",
              description: "BACnet Network",
              port: 47808,
              network_interface: "eth0",
              fast_poll_rate: 1,
              normal_poll_rate: 20,
              slow_poll_rate: 120,
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
            <Checkbox onChange={onCheckboxChange} style={{ marginBottom: "20px" }}>
              Show advanced options:{" "}
            </Checkbox>
            {showOptions && (
              <>
                <Form.Item label="Port" name="port">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Network interface" name="network_interface">
                  <Select placeholder="Select a serial port" options={interfaceNames} allowClear />
                </Form.Item>
                <Form.Item label="Fast poll rate (seconds)" name="fast_poll_rate">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Normal poll rate (seconds)" name="normal_poll_rate">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Slow poll rate (seconds)" name="slow_poll_rate">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </>
            )}
            <Form.Item wrapperCol={{ offset: 10, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={confirmLoading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )}
    </>
  );
};
