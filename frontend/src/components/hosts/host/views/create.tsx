import { Button, Modal, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { AddHost, EditHost } from "../../../../../wailsjs/go/backend/App";
import { openNotificationWithIcon } from "../../../../utils/utils";
import { JsonForm } from "../../../../common/json-schema-form";
import { amodel } from "../../../../../wailsjs/go/models";

export const AddButton = (props: any) => {
  const { showModal } = props;

  return (
    <Button
      type="primary"
      onClick={() => showModal({} as amodel.Host)}
      style={{ margin: "0 6px 10px 0", float: "left" }}
    >
      <PlusOutlined /> Host
    </Button>
  );
};

export const CreateEditModal = (props: any) => {
  const { hosts, hostSchema, currentHost, isModalVisible, isLoadingForm, refreshList, onCloseModal, connUUID } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentHost);

  useEffect(() => {
    setFormData(currentHost);
  }, [currentHost]);

  const addHost = async (host: amodel.Host) => {
    try {
      await AddHost(connUUID, host);
      openNotificationWithIcon("success", `added ${host.name} success`);
    } catch (error) {
      openNotificationWithIcon("error", `added ${host.name} fail`);
    }
  };

  const editHost = async (host: amodel.Host) => {
    try {
      await EditHost(connUUID, host.uuid, host);
      openNotificationWithIcon("success", `updated ${host.name} success`);
    } catch (error) {
      openNotificationWithIcon("error", `updated ${host.name} fail`);
    }
  };

  const handleClose = () => {
    setFormData({} as amodel.Host);
    onCloseModal();
  };

  const handleSubmit = (host: amodel.Host) => {
    setConfirmLoading(true);
    if (currentHost.uuid) {
      host.uuid = currentHost.uuid;
      editHost(host);
    } else {
      addHost(host);
    }
    setConfirmLoading(false);
    handleClose();
    refreshList();
  };

  const isDisabled = (): boolean => {
    let result = false;
    result =
      !formData.name ||
      (formData.name && (formData.name.length < 2 || formData.name.length > 50)) ||
      !formData.port ||
      (formData.port && (formData.port < 2 || formData.port > 65535)) ||
      !formData.ip ||
      !formData.network_uuid;
    return result;
  };

  return (
    <>
      <Modal
        title={currentHost.uuid ? "Edit " + currentHost.name : "New Host"}
        visible={isModalVisible}
        onOk={() => handleSubmit(formData)}
        onCancel={handleClose}
        confirmLoading={confirmLoading}
        okText="Save"
        okButtonProps={{
          disabled: isDisabled(),
        }}
        maskClosable={false} // prevent modal from closing on click outside
        style={{ textAlign: "start" }}
      >
        <Spin spinning={isLoadingForm}>
          <JsonForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} jsonSchema={hostSchema} />
        </Spin>
      </Modal>
    </>
  );
};
