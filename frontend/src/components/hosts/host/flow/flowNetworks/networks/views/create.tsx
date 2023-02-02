import { Modal } from "antd";
import { useEffect, useState } from "react";
import { model } from "../../../../../../../../wailsjs/go/models";

import { JsonForm } from "../../../../../../../common/json-schema-form";
import { FlowFrameworkNetworkFactory } from "../factory";
import { useParams } from "react-router-dom";
import { LOCAL_FLOW_NETWORKS_SCHEMA, REMOTE_FLOW_NETWORKS_SCHEMA } from "../../../../../../../constants/headers";
import FlowNetwork = model.FlowNetwork;

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentItem);
  const [schema, setSchema] = useState({});

  const factory = new FlowFrameworkNetworkFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    setFormData(currentItem);
  }, [isModalVisible]);

  useEffect(() => {
    if (formData.is_remote) {
      setSchema(REMOTE_FLOW_NETWORKS_SCHEMA);
    } else {
      setSchema(LOCAL_FLOW_NETWORKS_SCHEMA);
    }
  }, [formData.is_remote]);

  const handleSubmit = async (network: FlowNetwork) => {
    network.flow_https = false;
    network.flow_https_local = false;
    network.is_token_auth = true;
    network.is_master_slave = false;
    try {
      setConfirmLoading(true);
      if (currentItem.uuid) {
        network.uuid = currentItem.uuid;
        await factory.Update(network.uuid, network);
      } else {
        await factory.Add(network);
      }
      refreshList();
      onCloseModal();
    } catch (error) {
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={currentItem.uuid ? "Edit " + currentItem.name : "Add"}
        visible={isModalVisible}
        onOk={() => handleSubmit(formData)}
        onCancel={onCloseModal}
        confirmLoading={confirmLoading}
        okText="Save"
        maskClosable={false}
        style={{ textAlign: "start" }}
      >
        <JsonForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          jsonSchema={schema}
        />
      </Modal>
    </>
  );
};
