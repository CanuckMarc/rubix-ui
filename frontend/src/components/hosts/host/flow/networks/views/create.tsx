import { Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { model } from "../../../../../../../wailsjs/go/models";
import { JsonForm } from "../../../../../../common/json-schema-form";
import { FlowPluginFactory } from "../../plugins/factory";
import { FlowNetworkFactory } from "../factory";
import Network = model.Network;

const { Option } = Select;

export const EditModal = (props: any) => {
  const {
    currentItem,
    isModalVisible,
    isLoadingForm,
    networkSchema,
    onCloseModal,
    refreshList,
  } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState(currentItem);

  const flowNetworkFactory = new FlowNetworkFactory();
  flowNetworkFactory.connectionUUID = connUUID;
  flowNetworkFactory.hostUUID = hostUUID;

  useEffect(() => {
    setFormData(currentItem);
  }, [currentItem]);

  const edit = async (net: Network) => {
    await flowNetworkFactory.Update(net.uuid, net);
  };

  const handleClose = () => {
    setFormData({});
    onCloseModal();
  };

  const handleSubmit = async (item: any) => {
    setConfirmLoading(true);
    await edit(item);
    setConfirmLoading(false);
    handleClose();
    refreshList();
  };

  return (
    <>
      <Modal
        title={"Edit " + currentItem.name}
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
            jsonSchema={networkSchema}
          />
        </Spin>
      </Modal>
    </>
  );
};

export const CreateModal = (props: any) => {
  const { isModalVisible, onCloseModal, refreshList } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as Network);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [schema, setSchema] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [plugins, setPlugins] = useState([] as any);
  const [selectedPlugin, setSelectedPlugin] = useState("");

  const networkFactory = new FlowNetworkFactory();
  const pluginFactory = new FlowPluginFactory();
  pluginFactory.connectionUUID = networkFactory.connectionUUID = connUUID;
  pluginFactory.hostUUID = networkFactory.hostUUID = hostUUID;

  useEffect(() => {
    setFormData({} as Network);
    fetchPlugins();
  }, []);

  useEffect(() => {
    setSchema({});
    fetchPlugins();
    setSelectedPlugin("please enable and select plugin....");
  }, [isModalVisible]);

  const fetchPlugins = async () => {
    try {
      const res = (await pluginFactory.GetAll(true)) || [];
      setPlugins(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onChange = async (pluginName: string) => {
    setIsLoadingForm(true);
    setSelectedPlugin(pluginName);
    const res = await networkFactory.Schema(connUUID, hostUUID, pluginName);
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const handleClose = () => {
    setFormData({} as Network);
    onCloseModal();
  };

  const handleSubmit = async (item: Network) => {
    try {
      setConfirmLoading(true);
      item.plugin_name = selectedPlugin;
      await networkFactory.Add(item);
      refreshList();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title="Add New"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false} // prevent modal from closing on click outside
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isFetching}>
        <Select
          showSearch
          onChange={onChange}
          style={{ width: "100%", marginBottom: "10px" }}
          value={selectedPlugin}
        >
          {plugins.map((plugin: any) => (
            <Option key={plugin.uuid} value={plugin.name}>
              {plugin.name}
            </Option>
          ))}
        </Select>
        <Spin spinning={isLoadingForm}>
          <JsonForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            jsonSchema={schema}
            // a={console.log(schema)}
          />
        </Spin>
      </Spin>
    </Modal>
  );
};
