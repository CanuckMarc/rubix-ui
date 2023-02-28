import { Button, Form, Input, Spin, Checkbox, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FlowNetworkFactory } from "../factory";
import { FlowPluginFactory } from "../../plugins/factory";
import { model } from "../../../../../../../wailsjs/go/models";

import Network = model.Network;

interface ModbusFormPropType {
  type: string;
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

interface StringOptionType {
  value: string;
  label: string;
}

interface NumericalOptionType {
  value: number;
  label: number;
}

export const ModbusForm = (props: ModbusFormPropType) => {
  const {
    type,
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
  const [serialPortNames, setSerialPortNames] = useState<StringOptionType[]>([]);
  const [baudRateNames, setBaudRateNames] = useState<NumericalOptionType[]>([]);
  const [parityNames, setParityNames] = useState<StringOptionType[]>([]);
  const [databitNames, setDatabitNames] = useState<NumericalOptionType[]>([]);
  const [stopbitNames, setstopbitNames] = useState<NumericalOptionType[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isPluginInstalled("modbus")) {
      installPlugin("modbus");
    }
    form.resetFields();
  }, []);

  useEffect(() => {
    showOptions && fetchSchema("modbus");
  }, [showOptions]);

  const fetchSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await factory.Schema(connUUID, hostUUID, pluginName);
    if (res) {
      let portNameArray: StringOptionType[] = [];
      let baudNameArray: NumericalOptionType[] = [];
      let parityNameArray: StringOptionType[] = [];
      let databitNameArray: NumericalOptionType[] = [];
      let stopbitNameArray: NumericalOptionType[] = [];
      res.serial_port?.enum?.forEach((item: string) => {
        const obj = {
          value: item,
          label: item,
        };
        if (!portNameArray.some((item: StringOptionType) => item.value === obj.value)) {
          portNameArray.push(obj);
        }
      });
      res.serial_baud_rate?.enum?.forEach((item: number) => {
        baudNameArray.push({
          value: item,
          label: item,
        });
      });
      res.serial_parity?.enum?.forEach((item: string) => {
        parityNameArray.push({
          value: item,
          label: item,
        });
      });
      res.serial_data_bits?.enum?.forEach((item: number) => {
        databitNameArray.push({
          value: item,
          label: item,
        });
      });
      res.serial_stop_bits?.enum?.forEach((item: number) => {
        stopbitNameArray.push({
          value: item,
          label: item,
        });
      });
      setSerialPortNames(portNameArray);
      setBaudRateNames(baudNameArray);
      setParityNames(parityNameArray);
      setDatabitNames(databitNameArray);
      setstopbitNames(stopbitNameArray);
    }
    setIsLoadingForm(false);
  };

  const onFinish = async (values: Network) => {
    try {
      setConfirmLoading(true);
      await pluginFactory.BulkEnable(["modbus"]);
      values.plugin_name = "modbus";
      values.transport_type = type === "modbusSerial" ? "serial" : "ip";
      if (!values.name) values.name = "Modbus";
      if (!values.description) values.description = type === "modbusSerial" ? "Modbus serial" : "Modbus TCP";
      if (type === "modbusSerial") {
        if (!values.serial_port) values.serial_port = "/dev/ttyAMA0";
        if (!values.serial_baud_rate) values.serial_baud_rate = 38400;
        if (!values.serial_parity) values.serial_parity = "none";
        if (!values.serial_data_bits) values.serial_data_bits = 8;
        if (!values.serial_stop_bits) values.serial_stop_bits = 1;
        if (!values.serial_timeout) values.serial_timeout = 1;
      }
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
          <strong style={{ color: "orange" }}>Installing modules for Modbus, please wait...</strong>
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
              name: type === "modbusSerial" ? "Modbus serial" : "Modbus TCP",
              description: type === "modbusSerial" ? "Modbus serial Network" : "Modbus TCP Network",
              enable: true,
              serial_port: "/dev/tty/AMA0",
              serial_baud_rate: 38400,
              serial_parity: "none",
              serial_data_bit: 8,
              serial_stop_bit: 1,
              serial_timeout: 1,
              ip: type !== "modbusSerial" && "0.0.0.0",
              port: type !== "modbusSerial" && 502,
            }}
          >
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
                {type === "modbusSerial" ? (
                  <>
                    <Form.Item label="Serial port" name="serial_port">
                      <Select placeholder="Select a serial port" options={serialPortNames} allowClear />
                    </Form.Item>

                    <Form.Item label="Serial baud rate" name="serial_baud_rate">
                      <Select placeholder="Select a baud rate" options={baudRateNames} allowClear />
                    </Form.Item>

                    <Form.Item label="Serial parity" name="serial_parity">
                      <Select placeholder="Select a serial parity" options={parityNames} allowClear />
                    </Form.Item>

                    <Form.Item label="Serial data bit" name="serial_data_bit">
                      <Select placeholder="Select a serial data bit" options={databitNames} allowClear />
                    </Form.Item>

                    <Form.Item label="Serial stop bit" name="serial_stop_bit">
                      <Select placeholder="Select a serial stop bit" options={stopbitNames} allowClear />
                    </Form.Item>

                    <Form.Item label="Serial timeout (seconds)" name="serial_timeout">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Form.Item label="IP address" name="ip">
                      <Input />
                    </Form.Item>

                    <Form.Item label="Port number" name="port">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </>
                )}
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
