import { InputNumber, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { FlowPointFactory } from "../factory";
import { JsonForm } from "../../../../../../common/json-schema-form";
import { model } from "../../../../../../../wailsjs/go/models";
import {
  createColumns,
  MassEditTable,
} from "../../../../../../common/mass-edit-table";

import Point = model.Point;

export const CreateBulkModal = (props: any) => {
  const {
    isModalVisible,
    isLoadingForm,
    connUUID,
    hostUUID,
    deviceUUID,
    schema,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[] | undefined>([]);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const handleClose = () => {
    setItems([]);
    setCount(null);
    onCloseModal();
    setConfirmLoading(false);
  };

  const onCountChange = (count: number | null) => {
    setCount(count);
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.AddBulk(items);
      refreshList();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingForm) {
      setColumns(createColumns(schema.properties));
    }
  }, [isLoadingForm]);

  return (
    <Modal
      title="Add New Bulk"
      visible={isModalVisible}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false}
      style={{ textAlign: "start" }}
      width={800}
    >
      <InputNumber
        min={1}
        onChange={onCountChange}
        style={{ width: "100%", marginBottom: "1.5rem" }}
        placeholder="please enter count"
        value={count}
      />
      {count && (
        <MassEditTable
          parentPropId={{ key: "device_uuid", value: deviceUUID }}
          columns={columns}
          count={count}
          items={items}
          setItems={setItems}
        />
      )}
    </Modal>
  );
};

export const CreateModal = (props: any) => {
  const {
    isModalVisible,
    isLoadingForm,
    connUUID,
    hostUUID,
    deviceUUID,
    schema,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as Point);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const add = async (point: Point) => {
    await factory.Add(deviceUUID, point);
  };

  const handleClose = () => {
    setFormData({} as Point);
    onCloseModal();
  };

  const handleSubmit = async (point: Point) => {
    setConfirmLoading(true);
    await add(point);
    refreshList();
    setConfirmLoading(false);
    handleClose();
  };

  return (
    <Modal
      title="Add New"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          jsonSchema={schema}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
        />
      </Spin>
    </Modal>
  );
};
