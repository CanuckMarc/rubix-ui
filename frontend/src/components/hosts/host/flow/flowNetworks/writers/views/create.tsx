import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Spin } from "antd";
import { WritersFactory } from "../factory";
import { FlowNetworkFactory } from "../../../networks/factory";
import { model } from "../../../../../../../../wailsjs/go/models";
import { JsonForm } from "../../../../../../../common/json-schema-form";

import Writer = model.Writer;

export const CreateEditModal = (props: any) => {
  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "", consumerUUID = "" } = useParams();
  const [formData, setFormData] = useState(currentItem);
  const [schema, setSchema] = useState({} as any);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new WritersFactory();
  const flowNetworkFactory = new FlowNetworkFactory();
  factory.connectionUUID = flowNetworkFactory.connectionUUID = connUUID;
  factory.hostUUID = flowNetworkFactory.hostUUID = hostUUID;
  factory.consumerUUID = consumerUUID;

  useEffect(() => {
    if (!isModalVisible) return;
    if (!schema.properties) {
      getSchema();
    }
    setFormData(currentItem);
  }, [isModalVisible]);

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
          writer_thing_class: {
            readOnly: true,
            title: "thing class",
            type: "string",
            default: currentItem.writer_thing_class || "point",
          },
          writer_thing_uuid: {
            title: "Point",
            type: "string",
            anyOf: res?.map((n) => {
              return { type: "string", enum: [n.point_uuid], title: n.name };
            }),
            default: res.length && res[0].point_uuid,
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

  const handleSubmit = async (item: Writer) => {
    try {
      setConfirmLoading(true);
      if (currentItem.uuid) {
        await factory.Edit(currentItem.uuid, item);
      } else {
        item.consumer_uuid = consumerUUID;
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
