import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FlowPointFactory } from "../factory";
import { JsonForm } from "../../../../../../common/json-schema-form";
import { model } from "../../../../../../../wailsjs/go/models";

import Point = model.Point;

export const EditModal = (props: any) => {
  const { currentItemUUID, isModalVisible, isLoadingForm, schema, onCloseModal, refreshList } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as Point);
  const [currentItem, setCurrentItem] = useState({} as Point);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const edit = async (point: Point) => {
    await factory.Update(point.uuid, point);
  };

  const handleClose = () => {
    onCloseModal();
  };

  const handleSubmit = async (item: Point) => {
    setConfirmLoading(true);
    await edit(item);
    setConfirmLoading(false);
    handleClose();
    refreshList();
  };

  const fetchPoint = async (uuid: string) => {
    const res = (await factory.GetOne(uuid)) || {};
    setCurrentItem(res);
    setFormData(res);
  };

  useEffect(() => {
    if (isModalVisible) fetchPoint(currentItemUUID);
  }, [isModalVisible]);

  return (
    <>
      <Modal
        title={"Edit " + currentItem.name}
        visible={isModalVisible}
        onOk={() => handleSubmit(formData)}
        onCancel={handleClose}
        confirmLoading={confirmLoading}
        okText="Save"
        maskClosable={false}
        style={{ textAlign: "start" }}
      >
        <Spin spinning={isLoadingForm}>
          <JsonForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} jsonSchema={schema} />
        </Spin>
      </Modal>
    </>
  );
};
