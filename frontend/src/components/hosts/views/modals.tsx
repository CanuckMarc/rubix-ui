import { Modal, Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AddHost, EditHost } from "../../../../wailsjs/go/backend/App";
import { amodel } from "../../../../wailsjs/go/models";
import { JsonForm } from "../../../common/json-schema-form";
import { openNotificationWithIcon } from "../../../utils/utils";

import Host = amodel.Host;

export const CreateEditModal = (props: any) => {
  const { connUUID = "" } = useParams();
  const {
    hosts,
    hostSchema,
    currentHost,
    isModalVisible,
    isLoadingForm,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentHost);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    setFormData(currentHost);
  }, [currentHost]);

  const addHost = async (host: Host) => {
    try {
      await AddHost(connUUID, host);
      openNotificationWithIcon("success", `added ${host.name} success`);
    } catch (error) {
      openNotificationWithIcon("error", `added ${host.name} fail`);
    }
  };

  const editHost = async (host: Host) => {
    try {
      await EditHost(connUUID, host.uuid, host);
      hosts.findIndex((n: Host) => n.uuid === host.uuid);
      openNotificationWithIcon("success", `updated ${host.name} success`);
    } catch (error) {
      openNotificationWithIcon("error", `updated ${host.name} fail`);
    }
  };

  const handleClose = () => {
    setFormData({} as Host);
    onCloseModal();
  };

  const handleSubmit = async (host: Host) => {
    if (validationError) {
      return;
    }
    setConfirmLoading(true);
    if (currentHost.uuid) {
      host.uuid = currentHost.uuid;
      await editHost(host);
    } else {
      await addHost(host);
    }
    setConfirmLoading(false);
    handleClose();
    refreshList();
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
        okButtonProps={{ disabled: validationError }}
        maskClosable={false} // prevent modal from closing on click outside
        style={{ textAlign: "start" }}
      >
        <Spin spinning={isLoadingForm}>
          <JsonForm
            formData={formData}
            setFormData={setFormData}
            jsonSchema={hostSchema}
            setValidationError={setValidationError}
          />
        </Spin>
      </Modal>
    </>
  );
};
