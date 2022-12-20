import { Tabs, Spin, Space } from "antd";
import { PlusOutlined, PlayCircleOutlined, StopOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RbTable from "../../../../../../common/rb-table";
import { RbButton } from "../../../../../../common/rb-table-actions";
import { PLUGIN_HEADERS } from "../../../../../../constants/headers";
import { FlowNetworkFactory } from "../../networks/factory";
import { FlowPluginFactory } from "../factory";
import { CreateModal } from "./create";
import { PluginDistributionTable } from "./plugin-distribution-table";
import { PluginConfig } from "./plugin-config";

const { TabPane } = Tabs;
const pluginsKey = "MODULES";
const pluginDistribution = "INSTALL PLUGIN";

export const FlowPluginsTable = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [plugins, setPlugins] = useState([] as any);
  const [pluginName, setPluginName] = useState<string>();
  const [pluginsNames, setPluginsNames] = useState([] as Array<string>);
  const [networkSchema, setNetworkSchema] = useState({});
  const [selectedItem, setSelectedItem] = useState<any>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState<any>(false);

  const flowNetworkFactory = new FlowNetworkFactory();
  const factory = new FlowPluginFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    ...PLUGIN_HEADERS,
    {
      title: "Config",
      dataIndex: "config",
      key: "config",
      render: (_: any, item: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              showDrawer(item);
            }}
          >
            <EditOutlined />
          </a>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: Array<any>) => {
      setPluginsNames(selectedRows.map((x) => x.name));
    },
  };

  const EnablePluginsButton = () => {
    const enable = async () => {
      await factory.BulkEnable(pluginsNames);
      fetchPlugins();
    };

    return <RbButton type="primary" text="enable plugins" icon={<PlayCircleOutlined />} onClick={enable} />;
  };

  const DisablePluginsButton = () => {
    const disable = async () => {
      await factory.BulkDisable(pluginsNames);
      fetchPlugins();
    };

    return <RbButton type="ghost" text="disable plugins" onClick={disable} icon={<StopOutlined />} />;
  };

  const AddNetworkButton = () => {
    const showModal = () => {
      setIsModalVisible(true);
    };

    return <RbButton type="ghost" text="add network" onClick={showModal} icon={<PlusOutlined />} />;
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    if (pluginsNames.length > 0) {
      const pluginName = pluginsNames.at(0) || "";
      setPluginName(pluginName);
      const res = await flowNetworkFactory.Schema(connUUID, hostUUID, pluginName);
      const jsonSchema = {
        properties: res,
      };
      setNetworkSchema(jsonSchema);
      setIsLoadingForm(false);
    }
  };

  const fetchPlugins = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setPlugins(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const showDrawer = (item: any) => {
    setSelectedItem(item);
    setIsOpenDrawer(true);
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      getSchema();
    }
  }, [pluginsNames, isModalVisible]);

  return (
    <>
      <EnablePluginsButton />
      <DisablePluginsButton />
      <AddNetworkButton />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={plugins}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateModal
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        networkSchema={networkSchema}
        onCloseModal={() => setIsModalVisible(false)}
        pluginName={pluginName}
      />
      {selectedItem && isOpenDrawer && (
        <PluginConfig isVisible={isOpenDrawer} pluginName={selectedItem.name} onclose={() => setIsOpenDrawer(false)} />
      )}
    </>
  );
};

export const Plugins = () => {
  return (
    <Tabs defaultActiveKey={pluginsKey}>
      <TabPane tab={pluginsKey} key={pluginsKey}>
        <FlowPluginsTable />
      </TabPane>
      <TabPane tab={pluginDistribution} key={pluginDistribution}>
        <PluginDistributionTable />
      </TabPane>
    </Tabs>
  );
};
