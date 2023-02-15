import { Checkbox, Form, InputNumber, Modal, Select } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FlowProducerFactory } from "../../flowNetworks/producers/factory";

const HISTORY_TYPES = [
  { value: "COV", label: "COV" },
  { value: "INTERVAL", label: "INTERVAL" },
  { value: "COV_AND_INTERVAL", label: "COV_AND_INTERVAL" },
];

const formItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 15 } };

export const EditHistoryModal = (props: any) => {
  const { currentItem, isModalVisible, onCloseModal, refreshList } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [initData, setInitData] = useState({});

  const factory = new FlowProducerFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const handleSubmit = async (value: any) => {
    setConfirmLoading(true);
    await factory.EditProducerHistory(
      connUUID,
      hostUUID,
      currentItem.uuid,
      value.historyType,
      value.historyEnable,
      value.interval
    );
    setConfirmLoading(false);
    onCloseModal();
    refreshList();
  };

  useEffect(() => {
    if (isModalVisible && currentItem) {
      setInitData({
        historyType: "COV",
        historyEnable: true,
        interval: 15,
      });
    }
  }, [isModalVisible, currentItem]);

  useEffect(() => form.resetFields(), [initData]);

  return (
    <>
      <Modal
        forceRender
        title={"Edit history" + currentItem.name}
        visible={isModalVisible}
        onOk={form.submit}
        onCancel={onCloseModal}
        confirmLoading={confirmLoading}
        okText="Save"
        maskClosable={false}
        style={{ textAlign: "start" }}
      >
        <Form {...formItemLayout} labelAlign="left" form={form} initialValues={initData} onFinish={handleSubmit}>
          <Form.Item label="History type" name="historyType">
            <Select showSearch={true} options={HISTORY_TYPES} />
          </Form.Item>
          <Form.Item label="History enable:" name="historyEnable" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item label="Interval:" name="interval">
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
