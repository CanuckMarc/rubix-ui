import { useEffect, useState } from "react";
import { openNotificationWithIcon } from "../../../utils/utils";
import { Button, Collapse, Modal, Spin } from "antd";
import { JsonForm } from "../../../common/json-schema-form";
import { storage } from "../../../../wailsjs/go/models";
import { PlusOutlined } from "@ant-design/icons";
import RubixConnection = storage.RubixConnection;
import { ConnectionFactory } from "../../connections/factory";
const { Panel } = Collapse;

export const CreateModal = (props: any) => {
  const { selectedIpPorts, isModalVisible, onclose, refreshConnections } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState([] as RubixConnection[]);
  const [schema, setSchema] = useState({});
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [connections, setConnections] = useState([] as RubixConnection[]);

  const factory = new ConnectionFactory();

  useEffect(() => {
    getSchema();
  }, []);

  useEffect(() => {
    const newArr = [] as RubixConnection[];
    selectedIpPorts.forEach((i: any) => {
      let connection = {} as RubixConnection;
      connection = { ...connection, ip: i.ip, port: i.ports[0].port };
      newArr.push(connection);
    });
    setConnections(newArr);
  }, [selectedIpPorts]);

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    try {
      const res = await factory.Add();
      if (res && res.uuid) {
        openNotificationWithIcon("success", `added ${connection.name} success`);
      } else {
        openNotificationWithIcon("error", `added ${connection.name} fail`);
      }
    } catch (err) {
      openNotificationWithIcon("error", err);
      console.log(err);
    }
  };

  const handleClose = () => {
    setFormData([]);
    onclose();
  };

  const handleSubmit = async (connections: RubixConnection[]) => {
    let valid = true;
    connections.forEach((c) => {
      if (!c.name) {
        return (valid = false);
      }
    });
    if (valid) {
      try {
        setConfirmLoading(true);
        const promises = [];
        for (const c of connections) {
          promises.push(addConnection(c));
        }
        await Promise.all(promises);
        refreshConnections();
        handleClose();
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    } else {
      openNotificationWithIcon("error", "Please check again 'name' inputs!");
    }
  };

  const updateFormData = (data: RubixConnection) => {
    const index = connections.findIndex((c) => c.ip === data.ip);
    connections[index] = data;
    setFormData(connections);
  };

  return (
    <Modal
      title="Add New Supervisors"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      okText="Save"
      confirmLoading={confirmLoading}
      maskClosable={false} // prevent modal from closing on click outside
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <Collapse defaultActiveKey={["1"]}>
          {selectedIpPorts.map((i: any, index: number) => {
            return (
              <Panel header={i.ip} key={index + 1}>
                <JsonForm
                  formData={{ ip: i.ip, port: Number(i.ports[0].port) }}
                  jsonSchema={schema}
                  setFormData={updateFormData}
                />
              </Panel>
            );
          })}
        </Collapse>
      </Spin>
    </Modal>
  );
};

export const AddButton = (props: any) => {
  const { showModal } = props;

  return (
    <Button type="primary" onClick={() => showModal()} style={{ margin: "0 6px 10px 0", float: "left" }}>
      <PlusOutlined /> Supervisors
    </Button>
  );
};
