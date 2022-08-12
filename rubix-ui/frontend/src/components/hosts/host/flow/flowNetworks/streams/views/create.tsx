import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal } from "antd";
import { model } from "../../../../../../../../wailsjs/go/models";
import { JsonForm } from "../../../../../../../common/json-schema-form";

import Stream = model.Stream;
import { FlowStreamFactory } from "../factory";

export const CreateEditModal = (props: any) => {
  const {
    schema,
    currentItem,
    isModalVisible,
    refreshList,
    onCloseModal,
    flNetworkUUID,
  } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentItem);
  const flNetworkUUIDs = [flNetworkUUID];

  let factory = new FlowStreamFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    setFormData(currentItem);
  }, [isModalVisible]);

  const handleSubmit = async (stream: Stream) => {
    setConfirmLoading(true);
    if (currentItem.uuid) {
      stream.uuid = currentItem.uuid;
      await factory.Update(stream.uuid, stream);
    } else {
      const res = await factory.Add(stream, flNetworkUUIDs);
      console.log(res);
    }
    setConfirmLoading(false);
    refreshList();
    onCloseModal();
  };

  return (
    <>
      <Modal
        title={currentItem.uuid ? "Edit " + currentItem.name : "Add"}
        visible={isModalVisible}
        onOk={() => handleSubmit(formData)}
        onCancel={onCloseModal}
        confirmLoading={confirmLoading}
        okText="Save"
        maskClosable={false}
        style={{ textAlign: "start" }}
      >
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          jsonSchema={schema}
        />
      </Modal>
    </>
  );
};
