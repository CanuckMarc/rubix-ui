import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Spin } from "antd";
import { FlowNetworkFactory } from "../../../networks/factory";
import { FlowProducerFactory } from "../factory";
import { model } from "../../../../../../../../wailsjs/go/models";
import { JsonForm } from "../../../../../../../common/json-schema-form";

import Producer = model.Producer;

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "", streamUUID = "" } = useParams();
  const [formData, setFormData] = useState(currentItem);
  const [schema, setSchema] = useState({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  let factory = new FlowProducerFactory();
  let flowNetworkFactory = new FlowNetworkFactory();
  factory.connectionUUID = flowNetworkFactory.connectionUUID = connUUID;
  factory.hostUUID = flowNetworkFactory.hostUUID = hostUUID;


  useEffect(() => {
    setFormData(currentItem);
  }, [isModalVisible]);

  useEffect(() => {
    getSchema();
  }, []);

  const getSchema = async () => {
    try {
      setIsFetching(true);
      const res = await flowNetworkFactory.GetNetworksWithPointsDisplay();
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
            default:true,
          },
          enable_history: {
            title: "enable history",
            type: "boolean",
            default:false,
          },
          producer_thing_class: {
            type: "string",
            enum: ["point", "schedule"],
            default: "point",
          },
          producer_application: {
            type: "string",
            enum: ["mapping"],
            default: "mapping",
          },
          producer_thing_uuid: {
            title: "Point",
            type: "string",
            anyOf: res.map((n) => {
              return { type: "string", enum: [n.point_uuid], title: n.name };
            }),
            default: res[0].point_uuid,
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

  const handleSubmit = async (item: Producer) => {
    try {
      setConfirmLoading(true);
      if (currentItem.uuid) {
        item.uuid = currentItem.uuid;
        await factory.Update(item.uuid, item);
      } else {
        item = {
          ...item,
          stream_uuid: streamUUID,
          history_type: "",
          history_interval: 0,
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
