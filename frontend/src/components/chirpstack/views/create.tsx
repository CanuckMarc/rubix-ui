import { Form, Input, Modal, Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chirpstack } from "../../../../wailsjs/go/models";
import { ChirpFactory } from "../factory";

import Device = chirpstack.Device;

const formItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 15 } };

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isDeviceProfilesFetching, setIsDeviceProfilesFetching] = useState(false);
  const [deviceProfileOptions, setDeviceProfileOptions] = useState<any[]>([]);
  const [initData, setInitData] = useState({});

  const factory = new ChirpFactory();

  const add = async (device: Device) => {
    await factory.CSAddDevice(connUUID, hostUUID, device);
  };

  const edit = async (devEUI: string, device: Device) => {
    await factory.CSEditDevice(connUUID, hostUUID, devEUI, device);
  };

  const handleClose = () => {
    onCloseModal();
  };

  const handleSubmit = async (value: any) => {
    try {
      setConfirmLoading(true);
      const payload = {} as Device;
      payload.device = value;
      if (currentItem) {
        await edit(value.devEUI, payload);
      } else {
        await add(payload);
      }
      refreshList();
      handleClose();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const fetchDeviceProfiles = async () => {
    try {
      setIsDeviceProfilesFetching(true);
      const res = await factory.CSGetDeviceProfiles(connUUID, hostUUID);
      if (res && res.result) {
        const options = res.result.map((dp) => ({
          value: dp.id,
          label: dp.name,
        }));
        setDeviceProfileOptions(options);
      }
    } catch (err) {
      setDeviceProfileOptions([]);
    } finally {
      setIsDeviceProfilesFetching(false);
    }
  };

  useEffect(() => {
    if (!isModalVisible) return;
    if (currentItem) {
      setInitData({
        deviceProfileID: currentItem.deviceProfileID,
        devEUI: currentItem.devEUI,
        name: currentItem.name,
        applicationID: currentItem.applicationID,
        description: currentItem.description,
      });
    } else {
      setInitData({
        deviceProfileID: "",
        devEUI: "",
        name: "",
        applicationID: "",
        description: "",
      });
    }
  }, [isModalVisible]);

  useEffect(() => form.resetFields(), [initData]);

  useEffect(() => {
    if (!deviceProfileOptions || deviceProfileOptions.length === 0) {
      fetchDeviceProfiles();
    }
  }, []);

  return (
    <>
      <Modal
        style={{ textAlign: "start" }}
        title={currentItem && currentItem.devEUI ? "Edit " + currentItem.name : "Add New"}
        visible={isModalVisible}
        okText="Save"
        onOk={form.submit}
        onCancel={handleClose}
        confirmLoading={confirmLoading}
        maskClosable={false}
        width={600}
      >
        <Spin spinning={isDeviceProfilesFetching}>
          <Form {...formItemLayout} labelAlign="left" form={form} initialValues={initData} onFinish={handleSubmit}>
            <Form.Item
              label="Device Profile ID:"
              name="deviceProfileID"
              rules={[{ required: true, message: "Please select a Device Profile ID!" }]}
            >
              <Select showSearch={true} options={deviceProfileOptions} />
            </Form.Item>
            <Form.Item
              label="Device EUI:"
              name="devEUI"
              rules={[{ required: true, message: "Please input a device EUI!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Name:" name="name" rules={[{ required: true, message: "Please input a device name!" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Application ID:" name="applicationID">
              <Input />
            </Form.Item>
            <Form.Item
              label="Description:"
              name="description"
              rules={[{ required: true, message: "Please input a description!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};
