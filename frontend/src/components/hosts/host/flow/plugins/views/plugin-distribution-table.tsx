import { Modal, Spin, Switch } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RbTable from "../../../../../../common/rb-table";
import { FlowPluginFactory } from "../factory";
import { PluginDownloadModal } from "./plugin-download-modal";
import { RbRefreshButton } from "../../../../../../common/rb-table-actions";
import { RbSearchInput } from "../../../../../../common/rb-search-input";

const { confirm } = Modal;

export const PluginDistributionTable = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [plugins, setPlugins] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [pluginName, setPluginName] = useState<any>();
  const [isFetching, setIsFetching] = useState(false);
  const [isInstallModalVisible, setIsInstallModalVisible] = useState(false);

  const config = {
    originData: plugins,
    setFilteredData: setFilteredData,
  };

  const factory = new FlowPluginFactory();

  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Installed",
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
      setFilteredData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetchPlugins} />
      {plugins && plugins.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="name"
        dataSource={filteredData}
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
