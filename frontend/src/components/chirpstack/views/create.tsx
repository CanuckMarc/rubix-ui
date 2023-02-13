import { Form, Input, Modal, Select } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chirpstack } from "../../../../wailsjs/go/models";
import { ChirpFactory } from "../factory";

import DeviceProfiles = chirpstack.DeviceProfiles;
import Device = chirpstack.Device;
import DevicesResult = chirpstack.DevicesResult;

const formItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 15 } };

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [initData, setInitData] = useState({});

  const factory = new ChirpFactory();

  const add = async (item: DevicesResult) => {
    const payload = {} as Device;
    await factory.CSAddDevice(connUUID, hostUUID, payload);
  };

  const editNetwork = async (item: DevicesResult) => {
    const payload = {} as Device;
    await factory.CSEditDevice(connUUID, hostUUID, item.devEUI, payload);
  };

  const handleClose = () => {
    onCloseModal();
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      refreshList();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
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
        <Form {...formItemLayout} labelAlign="left" form={form} initialValues={initData} onFinish={handleSubmit}>
          <Form.Item
            label="Device Profile ID:"
            name="deviceProfileID"
            rules={[{ required: true, message: "Please select a Device Profile ID!" }]}
          >
            <Select showSearch={true} options={[]} />
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
      </Modal>
    </>
  );
};
