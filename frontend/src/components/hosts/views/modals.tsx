import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AddHost, EditHost } from "../../../../wailsjs/go/backend/App";
import { amodel } from "../../../../wailsjs/go/models";
import { JsonForm } from "../../../common/json-schema-form";
import { openNotificationWithIcon } from "../../../utils/utils";
import Host = amodel.Host;

export const CreateEditModal = (props: any) => {
  const { connUUID = "", netUUID = "" } = useParams();
  const {
    hostSchema,
    currentHost,
    isModalVisible,
    isLoadingForm,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentHost);
  const [validationError, setValidationError] = useState(true);

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
    host.network_uuid = netUUID;
    if (currentHost.uuid) {
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
