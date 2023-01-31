import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { AddLocation, UpdateLocation } from "../../../../wailsjs/go/backend/App";
import { JsonForm } from "../../../common/json-schema-form";
import { amodel } from "../../../../wailsjs/go/models";
import { hasError } from "../../../utils/response";
import { openNotificationWithIcon } from "../../../utils/utils";
import Location = amodel.Location;

export const CreateEditModal = (props: any) => {
  const {
    currentLocation,
    locationSchema,
    isModalVisible,
    isLoadingForm,
    connUUID,
    refreshList,
    onCloseModal,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentLocation);
  const [validationError, setValidationError] = useState(true);

  useEffect(() => {
    setFormData(currentLocation);
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation.uuid) {
      setValidationError(true);
    } else {
      setValidationError(false);
    }
  }, [currentLocation.uuid]);

  const addLocation = async (location: any) => {
    return AddLocation(connUUID, location);
  };

  const editLocation = async (location: Location) => {
    return UpdateLocation(connUUID, location.uuid, location);
  };

  const handleClose = () => {
    setFormData({} as Location);
    onCloseModal();
  };

  const handleSubmit = async (location: any) => {
    if (validationError) {
      return;
    }
    try {
      setConfirmLoading(true);
      delete location.connection_name;
      let res: any;
      let operation: string;
      if (currentLocation.uuid) {
        location.uuid = currentLocation.uuid;
        location.networks = currentLocation.networks;
        res = await editLocation(location);
        operation = "updated";
      } else {
        res = await addLocation(location);
        operation = "added";
      }
      if (!hasError(res)) {
        openNotificationWithIcon("success", `${operation} ${res.data.name} success`);
        handleClose();
      } else {
        openNotificationWithIcon("error", res.msg);
      }
      refreshList();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={
        currentLocation.uuid
          ? "Edit " + currentLocation.name
          : "Add New Location"
      }
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      okText="Save"
      confirmLoading={confirmLoading}
      okButtonProps={{ disabled: validationError }}
      maskClosable={false} // prevent modal from closing on click outside
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          jsonSchema={locationSchema}
          setValidationError={setValidationError}
        />
      </Spin>
    </Modal>
  );
};
