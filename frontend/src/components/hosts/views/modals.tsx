import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AddHost, EditHost } from "../../../../wailsjs/go/backend/App";
import { amodel } from "../../../../wailsjs/go/models";
import { JsonForm } from "../../../common/json-schema-form";
import { openNotificationWithIcon } from "../../../utils/utils";
import { hasError } from "../../../utils/response";
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

  useEffect(() => {
    if (currentHost.uuid) {
      setValidationError(true);
    } else {
      setValidationError(false);
    }
  }, [currentHost.uuid]);

  const addHost = async (host: Host) => {
    return await AddHost(connUUID, host);
  };

  const editHost = async (host: Host) => {
    return EditHost(connUUID, host.uuid, host);
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
    let res: any;
    let operation: string;
    if (currentHost.uuid) {
      res = await editHost(host);
      operation = "updated";
    } else {
      res = await addHost(host);
      operation = "added";
    }
    if (!hasError(res)) {
      openNotificationWithIcon("success", `${operation} ${res.data.name} success`);
      handleClose();
    } else {
      openNotificationWithIcon("error", res.msg);
    }
    setConfirmLoading(false);
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
