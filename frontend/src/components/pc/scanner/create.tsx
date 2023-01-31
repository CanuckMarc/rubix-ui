import { Button, Collapse, Modal, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { openNotificationWithIcon } from "../../../utils/utils";
import { JsonForm } from "../../../common/json-schema-form";
import { amodel, storage } from "../../../../wailsjs/go/models";
import { ConnectionFactory } from "../../connections/factory";
import { HostsFactory } from "../../hosts/factory";
import { useParams } from "react-router-dom";

import RubixConnection = storage.RubixConnection;
import Host = amodel.Host;
import { hasError } from "../../../utils/response";

const { Panel } = Collapse;

export const AddButton = (props: any) => {
  const { showModal } = props;

  return (
    <Button type="primary" onClick={() => showModal()} style={{ margin: "0 6px 10px 0", float: "left" }}>
      <PlusOutlined /> Supervisors
    </Button>
  );
};

export const CreateConnectionsModal = (props: any) => {
  const { selectedIpPorts, isModalVisible, onclose, refreshList } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState([] as RubixConnection[]);
  const [schema, setSchema] = useState({});
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [connections, setConnections] = useState([] as RubixConnection[]);

  const factory = new ConnectionFactory();

  const getSchema = async () => {
    setIsLoadingForm(true);
    const jsonSchema = await factory.Schema();
    setSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    const res = await factory.Add();
    if (!hasError(res)) {
      openNotificationWithIcon("success", `added ${res.data.name} success`);
    } else {
      openNotificationWithIcon("error", `added ${connection.name} fail`);
    }
  };

  const handleClose = () => {
    setFormData([]);
    onclose();
    setConfirmLoading(false);
  };

  const handleSubmit = async (connections: RubixConnection[]) => {
    try {
      setConfirmLoading(true);
      const promises = [];
      for (const c of connections) {
        promises.push(addConnection(c));
      }
      await Promise.all(promises);
      refreshList();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const updateFormData = (data: RubixConnection) => {
    const index = connections.findIndex((c) => c.ip === data.ip);
    connections[index] = data;
    setFormData(connections);
  };

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

export const CreateHostsModal = (props: any) => {
  const { selectedIpPorts, isModalVisible, onclose, refreshList } = props;
  const { connUUID = "" } = useParams();
  const [formData, setFormData] = useState<Host[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [schema, setSchema] = useState({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const factory = new HostsFactory();
  factory.connectionUUID = connUUID;

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const add = async (host: Host) => {
    factory.this = host;
    const res = await factory.Add();
    if (!hasError(res)) {
      openNotificationWithIcon("success", `added ${host.name} success`);
    } else {
      openNotificationWithIcon("error", res.msg);
    }
  };

  const handleClose = () => {
    setFormData([]);
    onclose();
    setConfirmLoading(false);
  };

  const handleSubmit = async (hosts: Host[]) => {
    try {
      setConfirmLoading(true);
      const promises = [];
      for (const h of hosts) {
        promises.push(add(h));
      }
      await Promise.all(promises);
      refreshList();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const updateFormData = (data: Host) => {
    const index = hosts.findIndex((h) => h.ip === data.ip);
    hosts[index] = data;
    setFormData(hosts);
  };

  useEffect(() => {
    getSchema();
  }, []);

  useEffect(() => {
    const newArr = [] as Host[];
    selectedIpPorts.forEach((i: any) => {
      let host = {} as Host;
      host = { ...host, ip: i.ip, port: i.ports[0].port };
      newArr.push(host);
    });
    setHosts(newArr);
  }, [selectedIpPorts]);

  return (
    <Modal
      title="Add New Hosts"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      okText="Save"
      confirmLoading={confirmLoading}
      maskClosable={false}
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
