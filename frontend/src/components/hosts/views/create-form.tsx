import { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { useParams } from "react-router-dom";
import { openNotificationWithIcon } from "../../../utils/utils";
import { AddHost, EditHost } from "../../../../wailsjs/go/backend/App";
import { JsonForm } from "../../../common/json-schema-form";
import { amodel } from "../../../../wailsjs/go/models";
import { hasError } from "../../../utils/response";
import Host = amodel.Host;

export const CreateHostForm = (props: any) => {
  const { connUUID = "", netUUID = "" } = useParams();
  const {
    currentHost,
    hostSchema,
    isLoadingForm,
    currentStep,
    setCurrentStep,
    refreshList,
    setNewHost
  } = props;
  const [formData, setFormData] = useState(currentHost);
  const [validationError, setValidationError] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    setFormData(currentHost);
  }, [currentHost]);

  useEffect(() => {
    if (currentHost.uuid) {
      setIsUpdate(true);
      setValidationError(true);
    } else {
      setIsUpdate(false);
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
  };

  const handleSubmit = async (host: Host) => {
    if (validationError) {
      return;
    }
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
      setNewHost(res.data)
      openNotificationWithIcon("success", `successfully ${operation} host ${res.data.name}!`);
      setCurrentStep(currentStep + 1)
      handleClose();
    } else {
      openNotificationWithIcon("error", res.msg);
    }
    refreshList();
  };

  const handleCreateButton = () => {
    handleSubmit(formData)
    setFormData({} as Host);
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          jsonSchema={hostSchema}
          setValidationError={setValidationError}
          style={{width: '100%'}}
        />
      </Spin>
      <Button type='primary' onClick={handleCreateButton} style={{width: '100px'}}>{isUpdate ? 'Update' : 'Create'}</Button>
    </div>
  );
};
