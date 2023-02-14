import { Modal, Input } from "antd";
import { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChirpFactory } from "../factory";

export const ActiveModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [key, setKey] = useState("");

  const factory = new ChirpFactory();

  const handleClose = () => {
    onCloseModal();
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.CSDeviceOTAKeys(connUUID, hostUUID, currentItem.devEUI, key);
      refreshList();
      handleClose();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  useEffect(() => {
    if (!isModalVisible) return;
    setKey("");
  }, [isModalVisible]);

  if (!currentItem) return <></>;

  return (
    <>
      <Modal
        style={{ textAlign: "start" }}
        title={"Active " + currentItem.name}
        visible={isModalVisible}
        okText="Save"
        onOk={handleSubmit}
        onCancel={handleClose}
        confirmLoading={confirmLoading}
        maskClosable={false}
        width={600}
      >
        <Input value={key} onChange={onChange} placeholder="Please enter a key..." />
      </Modal>
    </>
  );
};
