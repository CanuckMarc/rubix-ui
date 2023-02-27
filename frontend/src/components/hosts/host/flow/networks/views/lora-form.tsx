import { Button, Form, Input, Spin, Checkbox, Select } from "antd";
import { useEffect, useState } from "react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FlowNetworkFactory } from "../factory";
import { model } from "../../../../../../../wailsjs/go/models";

import Network = model.Network;

interface LoraFormPropType {
  connUUID: string;
  hostUUID: string;
  refreshList: Function;
  factory: FlowNetworkFactory;
  isPluginInstalled: Function;
  installPlugin: Function;
  confirmInstall: boolean;
  handleWizardClose: Function;
}

interface SerialPortOptionType {
  value: string;
  label: string;
}

interface SerialBaudRateOptionType {
  value: number;
  label: number;
}

export const LoraForm = (props: LoraFormPropType) => {
  const {
    connUUID,
    hostUUID,
    refreshList,
    factory,
    isPluginInstalled,
    installPlugin,
    confirmInstall,
    handleWizardClose,
  } = props;
  const [showOptions, setShowOptions] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [serialPortNames, setSerialPortNames] = useState<SerialPortOptionType[]>([]);
  const [baudRateNames, setBaudRateNames] = useState<SerialBaudRateOptionType[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isPluginInstalled("lora")) {
      installPlugin("lora");
    }
    form.resetFields();
  }, []);

  useEffect(() => {
    showOptions && fetchSchema("lora");
  }, [showOptions]);

  const fetchSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await factory.Schema(connUUID, hostUUID, pluginName);
    if (res) {
      let portNameArray: SerialPortOptionType[] = [];
      let baudNameArray: SerialBaudRateOptionType[] = [];
      res.serial_port?.enum?.forEach((item: string) => {
        const obj = {
          value: item,
          label: item,
        };
        if (!portNameArray.some((item: SerialPortOptionType) => item.value === obj.value)) {
          portNameArray.push(obj);
        }
      });
      res.serial_baud_rate?.enum?.forEach((item: number) => {
        baudNameArray.push({
          value: item,
          label: item,
        });
      });
      setSerialPortNames(portNameArray);
      setBaudRateNames(baudNameArray);
    }
    setIsLoadingForm(false);
  };

  const onFinish = async (values: Network) => {
    try {
      setConfirmLoading(true);
      values.plugin_name = "lora";
      if (!values.name) values.name = "LoRa";
      if (!values.description) values.description = "LoRa Network";
      if (!values.serial_port) values.serial_port = "/data/socat/loRa1";
      if (!values.serial_baud_rate) values.serial_baud_rate = 38400;
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
          <strong style={{ color: "orange" }}>Installing Plugin for LoRa</strong>
        </div>
      ) : (
        <Spin spinning={isLoadingForm}>
          <Form
            form={form}
            name="New LoRa network configuration"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
            onFinish={onFinish}
            autoComplete="off"
            initialValues={{
              name: "LoRa",
              description: "LoRa Network",
              serial_port: "/data/socat/loRa1",
              serial_baud_rate: 38400,
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
                <Form.Item label="Serial port" name="serial_port">
                  <Select placeholder="Select a serial port" options={serialPortNames} allowClear />
                </Form.Item>

                <Form.Item label="Serial baud rate" name="serial_baud_rate">
                  <Select placeholder="Select a baud rate" options={baudRateNames} allowClear />
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
