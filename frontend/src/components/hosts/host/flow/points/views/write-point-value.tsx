import { Col, InputNumber, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FlowPointFactory } from "../factory";
import { model } from "../../../../../../../wailsjs/go/models";

import Priority = model.Priority;

export const WritePointValueModal = (props: any) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const { isModalVisible, onCloseModal, refreshList, point } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as any);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const initialFormValues = (priority: Priority) => {
    const value = {
      _1: getNum(priority["_1"]),
      _2: getNum(priority["_2"]),
      _3: getNum(priority["_3"]),
      _4: getNum(priority["_4"]),
      _5: getNum(priority["_5"]),
      _6: getNum(priority["_6"]),
      _7: getNum(priority["_7"]),
      _8: getNum(priority["_8"]),
      _9: getNum(priority["_9"]),
      _10: getNum(priority["_10"]),
      _11: getNum(priority["_11"]),
      _12: getNum(priority["_12"]),
      _13: getNum(priority["_13"]),
      _14: getNum(priority["_14"]),
      _15: getNum(priority["_15"]),
      _16: getNum(priority["_16"]),
    };
    setFormData(value);
  };

  const getNum = (value: any) => {
    if (typeof value === "number" && String(value)) {
      //include case value = 0
      return value;
    } else {
      //include case typeof value = string
      return null;
    }
  };
  const onChange = (value: number, priorityKey: string) => {
    formData[priorityKey] = Number(value);
    setFormData(formData);
  };

  const handleClose = () => {
    setFormData({} as Priority);
    onCloseModal();
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.WritePointValue(point.uuid, formData);
      refreshList();
    } finally {
      setConfirmLoading(false);
    }
  };

  const getPointPriority = async () => {
    const { priority = {} } = await factory.GetPointPriority(point.uuid);
    if (priority) {
      delete priority.point_uuid;
      initialFormValues(priority);
    } else {
      initialFormValues({});
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      getPointPriority();
    }
  }, [isModalVisible]);

  return (
    <Modal
      centered
      title={`Write Priority Array: ${point.name}`}
      okText="Send"
      style={{ textAlign: "start" }}
      maskClosable={false}
      visible={isModalVisible}
      confirmLoading={confirmLoading}
      onOk={handleSubmit}
      onCancel={handleClose}
    >
      <Row gutter={[16, 24]}>
        {Object.keys(formData).map((priorityKey: string) => (
          <Col span={6} key={priorityKey}>
            <InputNumber
              step="0.01"
              stringMode
              placeholder={priorityKey}
              defaultValue={formData[priorityKey]}
              onChange={(v: number) => {
                onChange(v, priorityKey);
              }}
            />
          </Col>
        ))}
      </Row>
    </Modal>
  );
};
