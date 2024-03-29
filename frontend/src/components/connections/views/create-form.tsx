import { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { storage } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { ConnectionFactory } from "../factory";
import { JsonForm } from "../../../common/json-schema-form";
import RubixConnection = storage.RubixConnection;
import { hasError } from "../../../utils/response";

export const CreateConnectionForm = (props: any) => {
  const { currentConnection, connectionSchema, isLoadingForm, refreshList, currentStep, setCurrentStep, setNewConnection } = props;
  const [formData, setFormData] = useState(currentConnection);
  const [validationError, setValidationError] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const factory = new ConnectionFactory();

  useEffect(() => {
    setFormData(currentConnection);
  }, [currentConnection]);

  useEffect(() => {
    if (currentConnection.uuid) {
      setIsUpdate(true);
      setValidationError(true);
    } else {
      setIsUpdate(false);
      setValidationError(false);
    }
  }, [currentConnection.uuid]);

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    return await factory.Add();
  };

  const editConnection = async (connection: RubixConnection) => {
    factory.uuid = connection.uuid;
    return await factory.Update();
  };

  const handleClose = () => {
    setFormData({} as RubixConnection);
  };

  const handleSubmit = async (connection: RubixConnection) => {
    if (validationError) {
      return;
    }
    factory.this = connection;
    let res: any;
    let operation: string;

    if (currentConnection.uuid) {
      connection.uuid = currentConnection.uuid;
      res = await editConnection(connection);
      operation = "updated";
    } else {
      res = await addConnection(connection);
      operation = "created";
    }

    if (!hasError(res)) {
      setNewConnection(res.data)
      openNotificationWithIcon("success", `successfully ${operation} connection ${res.data.name}!`);
      setCurrentStep(currentStep + 1)
      handleClose();
    } else {
      openNotificationWithIcon("error", res.msg);
    }
    refreshList();
  };

  const handleCreateButton = () => {
    handleSubmit(formData)
    setFormData({} as RubixConnection);
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          jsonSchema={connectionSchema}
          setValidationError={setValidationError}
          style={{width: '100%'}}
        />
      </Spin>
      <Button type='primary' onClick={handleCreateButton} style={{width: '100px'}}>{isUpdate ? 'Update' : 'Create'}</Button>
    </div>
  );
};
