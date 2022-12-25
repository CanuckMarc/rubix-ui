import { Input, Modal, Spin, Switch } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RbTable from "../../../../../../common/rb-table";
import { FlowPluginFactory } from "../factory";
import { PluginDownloadModal } from "./plugin-download-modal";
import { RbRefreshButton } from "../../../../../../common/rb-table-actions";

const { confirm } = Modal;

export const PluginDistributionTable = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [plugins, setPlugins] = useState<any[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<any[]>([]);
  const [pluginName, setPluginName] = useState<any>();
  const [isFetching, setIsFetching] = useState(false);
  const [isInstallModalVisible, setIsInstallModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const factory = new FlowPluginFactory();

  const columns = [
    {
      title: "name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "installed",
      key: "is_installed",
      dataIndex: "is_installed",
      render(is_installed: boolean, item: any) {
        return <Switch checked={is_installed} onChange={() => onChange(item)} />;
      },
    },
  ];

  const onChange = async (item: any) => {
    setPluginName(item.name);
    if (!item.is_installed) {
      setIsInstallModalVisible(true);
    } else {
      showUnInstallConfirm(item.name);
    }
  };

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const showUnInstallConfirm = (pluginName: string) => {
    confirm({
      title: "Confirm",
      icon: <ExclamationCircleFilled />,
      content: "Do you want to uninstall these apps ?",
      className: "text-start",
      onOk() {
        return unInstallPlugin(pluginName);
      },
      onCancel() {},
    });
  };

  const unInstallPlugin = async (pluginName: string) => {
    await factory.UnInstallPlugin(connUUID, hostUUID, pluginName);
    fetchPlugins();
  };

  const fetchPlugins = async () => {
    try {
      setIsFetching(true);
      const { data = [] } = await factory.GetPluginsDistribution(connUUID, hostUUID);
      setPlugins(data);
      setFilteredPlugins(data);
      setSearch("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase().trim();
    const _filteredPlugins =
      keyword.length > 0 ? plugins.filter((item: any) => item.name.toLowerCase().includes(keyword)) : plugins;
    setFilteredPlugins(_filteredPlugins);
  }, [search]);

  return (
    <>
      <RbRefreshButton refreshList={fetchPlugins} />
      <Input placeholder="Search name..." allowClear value={search} onChange={handleChangeSearch} className="mt-2" />
      <RbTable
        rowKey="name"
        dataSource={filteredPlugins}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <PluginDownloadModal
        isModalVisible={isInstallModalVisible}
        pluginName={pluginName}
        handleClose={() => setIsInstallModalVisible(false)}
        refreshList={fetchPlugins}
      />
    </>
  );
};
