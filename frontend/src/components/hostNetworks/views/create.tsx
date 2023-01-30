import { Modal, Spin } from "antd";
import { amodel } from "../../../../wailsjs/go/models";
import { useEffect, useState } from "react";
import { JsonForm } from "../../../common/json-schema-form";
import { useParams } from "react-router-dom";
import { NetworksFactory } from "../factory";

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
  const [formData, setFormData] = useState(currentNetwork);

  const factory = new NetworksFactory();
  factory.connectionUUID = connUUID;

  useEffect(() => {
    setFormData(currentNetwork);
  }, [currentNetwork]);

  const addNetwork = async (network: Network) => {
    factory._this = network;
    await factory.Add();
  };

  const editNetwork = async (network: Network) => {
    factory.uuid = network.uuid;
    factory._this = network;
    await factory.Update();
  };

  const handleClose = () => {
    setFormData({} as Network);
    onCloseModal();
  };

  const handleSubmit = async (network: Network) => {
    try {
      setConfirmLoading(true);
      network.location_uuid = locUUID
      if (currentNetwork.uuid) {
        network.uuid = currentNetwork.uuid;
        network.hosts = currentNetwork.hosts;
        await editNetwork(network);
      } else {
        await addNetwork(network);
      }
      handleClose();
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
        okText="Save"
        maskClosable={false} // prevent modal from closing on click outside
        style={{ textAlign: "start" }}
      >
        <Spin spinning={isLoadingForm}>
          <JsonForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            jsonSchema={schema}
          />
        </Spin>
      </Modal>
    </>
  );
};
