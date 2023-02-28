import { Button, Form, Input, Spin, Checkbox, Select } from "antd";
import { useEffect, useState } from "react";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { FlowDeviceFactory } from "../factory";
import { model } from "../../../../../../../wailsjs/go/models";
import { LoraWizardTypes } from "./lora-wizard";
import { useParams } from "react-router-dom";

import Device = model.Device;

interface LoraFormPropType {
  model: LoraWizardTypes;
  refreshList: Function;
  handleWizardClose: Function;
}

interface SerialPortOptionType {
  value: string;
  label: string;
}

export const LoraForm = (props: LoraFormPropType) => {
  const { model, refreshList, handleWizardClose } = props;
  const { connUUID = "", networkUUID = "", hostUUID = "", pluginName = "" } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [flowNetOptionList, setFlowNetOptionList] = useState<SerialPortOptionType[]>([]);
  const [selectMapping, setSelectMapping] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [form] = Form.useForm();

  const flowDeviceFactory = new FlowDeviceFactory();
  flowDeviceFactory.connectionUUID = connUUID;
  flowDeviceFactory.hostUUID = hostUUID;
  const isRemote = !!connUUID && !!hostUUID;

  useEffect(() => {
    form.resetFields();
  }, []);

  useEffect(() => {
    showOptions && fetchSchema();
  }, [showOptions]);

  useEffect(() => {
    if (selectMapping === false) {
      form.setFieldsValue({ auto_mapping_flow_network_name: null });
    }
  }, [selectMapping]);

  const fetchSchema = async () => {
    setIsLoadingForm(true);
    const res = await flowDeviceFactory.Schema(connUUID, hostUUID, pluginName);
    if (res && res.auto_mapping_flow_network_name?.enum?.length !== 0) {
      setFlowNetOptionList(
        res.auto_mapping_flow_network_name.enum.map((item: string) => ({
          value: item,
          label: item,
        }))
      );
    }
    setIsLoadingForm(false);
  };

  const onFinish = async (values: Device) => {
    try {
      setConfirmLoading(true);
      values.model = model;
      if (!values.name) values.name = model === "MicroEdge" ? model : `Droplet ${model}`;
      if (!values.description)
        values.description = model === "MicroEdge" ? `${model} device` : `Droplet ${model} device`;
      console.log("form values are: ", values);
      await flowDeviceFactory.Add(networkUUID, values);
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
      <Spin spinning={isLoadingForm}>
        <Form
          form={form}
          name="New LoRa network configuration"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{
            name: model === "MicroEdge" ? model : `Droplet ${model}`,
            description: model === "MicroEdge" ? `${model} device` : `Droplet ${model} device`,
            enable: true,
          }}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item
            label="Device serial number"
            name="address_uuid"
            extra="Eight digit LoRa device serial number located on the side of each device."
            rules={[
              {
                required: true,
                message: "Please input a LoRa device serial number",
              },
            ]}
          >
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
              <Form.Item label="Auto mapping enable" name="auto_mapping_enable" valuePropName="checked">
                <Checkbox
                  value={selectMapping}
                  onChange={(e) => {
                    setSelectMapping(e.target.checked);
                  }}
                />
              </Form.Item>

              <Form.Item label="Existing flow network" name="auto_mapping_flow_network_name">
                <Select
                  placeholder="Select a flow network"
                  disabled={!selectMapping}
                  options={flowNetOptionList}
                  allowClear
                />
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
    </>
  );
};
