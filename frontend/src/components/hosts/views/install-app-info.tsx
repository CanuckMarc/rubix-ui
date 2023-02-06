import { Button, Divider, Dropdown, List, Menu, Modal, Typography, Skeleton } from "antd";
import { DownloadOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rumodel } from "../../../../wailsjs/go/models";
import { RbRefreshButton } from "../../../common/rb-table-actions";
import RbTag from "../../../common/rb-tag";
import RbVersion, { VERSION_STATES } from "../../../common/rb-version";
import { orderBy } from "../../../utils/utils";
import { ReleasesFactory } from "../../release/factory";
import { InstallAppFactory } from "./install-rubix-app/factory";
import { InstallRubixAppModal } from "./install-rubix-app/install-rubix-app-modal";
import { tagMessageStateResolver } from "./utils";
import InstalledApps = rumodel.InstalledApps;
import AppsAvailableForInstall = rumodel.AppsAvailableForInstall;
import RunningServices = rumodel.RunningServices;

const { Text, Title } = Typography;
const releaseFactory = new ReleasesFactory();
const installAppFactory = new InstallAppFactory();

export const EdgeAppInfo = (props: any) => {
  const { host } = props;
  const { connUUID = "" } = useParams();
  const [isLoading, updateIsLoading] = useState(false);
  const [isActionLoading, updateActionLoading] = useState({} as any);
  const [installedApps, updateInstalledApps] = useState([] as InstalledApps[]);
  const [availableApps, updateAvailableApps] = useState([] as AppsAvailableForInstall[]);
  const [runningServices, updateRunningServices] = useState([] as RunningServices[]);
  const [appInfoMsg, updateAppInfoMsg] = useState("");
  const [selectedApp, updateSelectedApp] = useState({} as InstalledApps);
  const [installedVersion, updateInstalledVersion] = useState("");
  const [isInstallRubixAppModalVisible, updateIsInstallRubixAppModalVisible] = useState(false);

  let timeout;

  installAppFactory.connectionUUID = connUUID;

  useEffect(() => {
    fetchAppInfo().catch(console.error);
    return () => {
      timeout = null;
    };
  }, [host]);

  const fetchAppInfo = async () => {
    updateAppInfoMsg("");
    updateIsLoading(true);
    try {
      if (host) {
        const response = await releaseFactory.EdgeAppsInfo(connUUID, host.uuid);
        if (response?.code === 0) {
          const _installed_apps = orderBy(response?.data?.installed_apps, "app_name");
          const _apps_available_for_install = orderBy(response?.data?.apps_available_for_install, "app_name");
          const _running_services = orderBy(response?.data?.running_services, "name");
          updateInstalledApps(_installed_apps);
          updateAvailableApps(_apps_available_for_install);
          updateRunningServices(_running_services);
        } else {
          updateAppInfoMsg(response?.msg || "fetch edge apps info gone wrong");
        }
      }
    } finally {
      updateIsLoading(false);
    }
  };

  if (appInfoMsg) {
    return (
      <span>
        {appInfoMsg}
        <span className="ml-3">
          <a onClick={() => fetchAppInfo()}>Click here to refresh</a>
        </span>
      </span>
    );
  }

  const onMenuClick = (actionType: string, serviceName: string, appName: string) => {
    updateActionLoading((prevState: any) => ({
      ...prevState,
      [serviceName]: true,
    }));
    return releaseFactory
      .EdgeServiceAction(actionType, connUUID, host.uuid, serviceName, appName)
      .then(() => {
        fetchAppInfo().catch(console.log);
      })
      .finally(() => {
        updateActionLoading((prevState: any) => ({
          ...prevState,
          [serviceName]: false,
        }));
      });
  };

  const setIsInstallRubixAppModalVisible = (item: any) => {
    const selectedInstalledApp = installedApps.find((app) => app.app_name == item.app_name)?.version;
    updateSelectedApp(item);
    updateInstalledVersion(selectedInstalledApp || "");
    updateIsInstallRubixAppModalVisible(true);
  };

  const onCloseRubixAppInstallModal = () => {
    updateIsInstallRubixAppModalVisible(false);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh'}}>
      
      <div>
        <RbRefreshButton refreshList={() => fetchAppInfo()} />
      </div>
        
      
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 0",
          borderBottom: "1px solid #dfdfdf",
        }}
      >
        <Title level={5}>App details</Title>
      </div> */}
      
      <List
        itemLayout="horizontal"
        loading={isLoading}
        bordered={true}
        dataSource={availableApps}
        header={<strong>Available Apps</strong>}
        renderItem={(item) => (
          <List.Item style={{ padding: "0 16px" }}>
            <DownloadOutlined onClick={() => setIsInstallRubixAppModalVisible(item)} className="ml-4 mr-10" />
            <List.Item.Meta
              title={<span>{item.app_name}</span>}
              description={`(${item.min_version || "Infinite"} - ${item.max_version || "Infinite"})`}
            />
          </List.Item>
        )}
      />

      <List
        itemLayout="horizontal"
        loading={isLoading}
        bordered={true}
        dataSource={installedApps}
        header={<strong>Installed Apps</strong>}
        renderItem={(item) => (
          <List.Item style={{ padding: "8px 16px" }}>
            <span className="mr-6">
              <Dropdown trigger={["click"]}
                        overlay={<ConfirmActionMenu item={item} onMenuClick={onMenuClick} hasUninstall={true} />}>
                <Button icon={<EllipsisOutlined />} loading={isActionLoading[item.service_name || ""] || false} />
              </Dropdown>
            </span>

            <span style={{ width: "250px" }}>{item.app_name}</span>
            <span style={{ width: 100, float: "right" }}>
              <RbVersion
                state={
                  item.downgrade_required
                    ? VERSION_STATES.DOWNGRADE
                    : item.upgrade_required
                      ? VERSION_STATES.UPGRADE
                      : VERSION_STATES.NONE
                }
                version={item.version}
              />
            </span>
            <span
              className="flex-1"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                borderLeft: "1px solid #dfdfdf",
                padding: "0 2rem",
              }}
            >
              <span>
                <RbTag state={item.state} />
                <RbTag state={item.sub_state} />
                <RbTag state={item.active_state} />
              </span>

              <Text style={{ paddingTop: 5 }} type="secondary" italic>
                {tagMessageStateResolver(item.state, item.sub_state, item.active_state)}
              </Text>
            </span>
          </List.Item>
        )}
      />
      

      <List
        itemLayout="horizontal"
        loading={isLoading}
        bordered={true}
        dataSource={runningServices}
        header={<strong>Running Services</strong>}
        renderItem={(item) => (
          <List.Item style={{ padding: "8px 16px" }}>
            <span className="mr-6">
              <Dropdown trigger={["click"]}
                        overlay={<ConfirmActionMenu item={item} onMenuClick={onMenuClick} hasUninstall={false} />}>
                <Button icon={<EllipsisOutlined />} loading={isActionLoading[item.service_name || ""] || false} />
              </Dropdown>
            </span>

            <span style={{ width: "350px" }}>{item.name}</span>
            <span
              className="flex-1"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                borderLeft: "1px solid #dfdfdf",
                padding: "0 2rem",
              }}
            >
              <span>
                <RbTag state={item.state} />
                <RbTag state={item.sub_state} />
                <RbTag state={item.active_state} />
              </span>

              <Text style={{ paddingTop: 5 }} type="secondary" italic>
                {tagMessageStateResolver(item.state, item.sub_state, item.active_state)}
              </Text>
            </span>
          </List.Item>
        )}
      />

      <InstallRubixAppModal
        isModalVisible={isInstallRubixAppModalVisible}
        onCloseModal={onCloseRubixAppInstallModal}
        installFactory={installAppFactory}
        host={host}
        app={selectedApp}
        installedVersion={installedVersion}
        fetchAppInfo={fetchAppInfo}
      />
      
    </div>
  );
};

const ConfirmActionMenu = (props: any) => {
  const { item, onMenuClick, hasUninstall } = props;

  const showConfirm = (actionType: string) => {
    Modal.confirm({
      title: `App ${actionType}`,
      content: "Are you sure?",
      className: "text-start",
      onOk() {
        return onMenuClick(actionType, item.service_name, item.app_name);
      },
    });
  };

  const MenuItemLabel = (actionType: string) => {
    return (
      <Button type="text" onClick={() => showConfirm(actionType.toLowerCase())}>
        {actionType}
      </Button>
    );
  };

  const operations = [];
  operations.push({
      key: "start",
      label: MenuItemLabel("Start"),
    }, {
      key: "restart",
      label: MenuItemLabel("Restart"),
    },
    {
      key: "stop",
      label: MenuItemLabel("Stop"),
    });

  if (hasUninstall) {
    operations.push({
      key: "uninstall",
      label: MenuItemLabel("Uninstall"),
    });
  }

  return (
    <Menu items={operations} />
  );
};
