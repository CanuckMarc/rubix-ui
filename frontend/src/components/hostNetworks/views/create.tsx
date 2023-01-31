import { Modal, Spin } from "antd";
import { amodel } from "../../../../wailsjs/go/models";
import { useEffect, useState } from "react";
import { JsonForm } from "../../../common/json-schema-form";
import { useParams } from "react-router-dom";
import { NetworksFactory } from "../factory";
import { hasError } from "../../../utils/response";
import { openNotificationWithIcon } from "../../../utils/utils";
import Network = amodel.Network;

export const CreateEditModal = (props: any) => {
  const { connUUID = "", locUUID = "" } = useParams();
  const {
    schema,
    currentNetwork,
    isModalVisible,
    isLoadingForm,
    refreshList,
    onCloseModal,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [validationError, setValidationError] = useState(true);
  const [formData, setFormData] = useState(currentNetwork);

  const factory = new NetworksFactory();
  factory.connectionUUID = connUUID;

  useEffect(() => {
    setFormData(currentNetwork);
  }, [currentNetwork]);

  useEffect(() => {
    console.log("here i am...")
    if (currentNetwork.uuid) {
      setValidationError(true);
    } else {
      setValidationError(false);
    }
  }, [currentNetwork.uuid]);

  const addNetwork = async (network: Network) => {
    factory._this = network;
    return await factory.Add();
  };

  const editNetwork = async (network: Network) => {
    factory.uuid = network.uuid;
    factory._this = network;
    return await factory.Update();
  };

  const handleClose = () => {
    setFormData({} as Network);
    onCloseModal();
  };

  const handleSubmit = async (network: Network) => {
    try {
      setConfirmLoading(true);
      network.location_uuid = locUUID;
      let res: any;
      let operation: string;
      if (currentNetwork.uuid) {
        network.uuid = currentNetwork.uuid;
        network.hosts = currentNetwork.hosts;
        res = await editNetwork(network);
        operation = "updated";
      } else {
        res = await addNetwork(network);
        operation = "added";
      }
      if (!hasError(res)) {
        openNotificationWithIcon("success", `${operation} ${res.data.name} success`);
        handleClose();
      } else {
        openNotificationWithIcon("error", res.msg);
      }
      refreshList();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={
          currentNetwork.uuid ? "Edit " + currentNetwork.name : "New Network"
        }
        visible={isModalVisible}
        onOk={() => handleSubmit(formData)}
        onCancel={handleClose}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: validationError }}
        okText="Save"
        maskClosable={false} // prevent modal from closing on click outside
        style={{ textAlign: "start" }}
      >
        <Spin spinning={isLoadingForm}>
          <JsonForm
            formData={formData}
            setFormData={setFormData}
            setValidationError={setValidationError}
            jsonSchema={schema}
          />
        </Spin>
      </Modal>
    </>
  );
};
