import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Spin } from "antd";
import { FlowConsumerFactory } from "../factory";
import { FlowProducerFactory } from "../../producers/factory";
import { model } from "../../../../../../../../wailsjs/go/models";
import { JsonForm } from "../../../../../../../common/json-schema-form";
import Consumer = model.Consumer;

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "", streamUUID = "", streamCloneUUID = "" } = useParams();
  const [formData, setFormData] = useState(currentItem);
  const [schema, setSchema] = useState({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowConsumerFactory();
  const producerFactory = new FlowProducerFactory();
  factory.connectionUUID = producerFactory.connectionUUID = connUUID;
  factory.hostUUID = producerFactory.hostUUID = hostUUID;
  producerFactory.streamUUID = streamUUID;
  factory.streamCloneUUID = streamCloneUUID;

  useEffect(() => {
    setFormData(currentItem);
  }, [isModalVisible]);

  useEffect(() => {
    getSchema();
  }, []);

  const getSchema = async () => {
    try {
      setIsFetching(true);
      const res = await producerFactory.GetAll();
      const jsonSchema = {
        properties: {
          uuid: {
            readOnly: true,
            title: "uuid",
            type: "string",
          },
          name: {
            maxLength: 50,
            minLength: 2,
            title: "name",
            type: "string",
          },
          enable: {
            title: "enable",
            type: "boolean",
            default: true,
          },
          producer_uuid: {
            title: "producer",
            type: "string",
            anyOf: res.map((n) => {
              return { type: "string", enum: [n.uuid], title: n.name };
            }),
            default: res[0].uuid,
          },
        },
      };
      setSchema(jsonSchema);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (item: Consumer) => {
    try {
      setConfirmLoading(true);
      if (currentItem.uuid) {
        await factory.Update(currentItem.uuid, item);
      } else {
        item = {
          ...item,
          stream_clone_uuid: streamCloneUUID,
        } as any;
        await factory.Add(item);
      }
      refreshList();
      onCloseModal();
    } catch (error) {
      console.log(error);
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
        <Spin spinning={isFetching}>
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
