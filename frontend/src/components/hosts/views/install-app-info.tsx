import { Button, Dropdown, List, Menu, Modal, Typography, Popconfirm } from "antd";
import { DownloadOutlined, EllipsisOutlined, DeleteOutlined, BookOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rumodel } from "../../../../wailsjs/go/models";
import { RbRefreshButton, RbSyncButton } from "../../../common/rb-table-actions";
import RbTag from "../../../common/rb-tag";
import RbVersion, { VERSION_STATES } from "../../../common/rb-version";
import { orderBy } from "../../../utils/utils";
import { ReleasesFactory } from "../../release/factory";
import { InstallAppFactory } from "./install-rubix-app/factory";
import { InstallRubixAppModal } from "./install-rubix-app/install-rubix-app-modal";
import { tagMessageStateResolver } from "./utils";
import { openNotificationWithIcon } from "../../../utils/utils";
import { GitDownloadReleases } from "../../../../wailsjs/go/backend/App";
import { AppLogModal } from "./appLogModal";
import InstalledApps = rumodel.InstalledApps;
import AppsAvailableForInstall = rumodel.AppsAvailableForInstall;
import RunningServices = rumodel.RunningServices;

export interface AppLogModalPropType {
  appName: string | undefined;
  connUUID: string;
  hostUUID: string;
  isShowingLog: boolean;
  setIsShowingLog: Function;
}

const { Text, Title } = Typography;
const releaseFactory = new ReleasesFactory();
const installAppFactory = new InstallAppFactory();

export const EdgeAppInfo = (props: any) => {
  const { host } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [isLoading, updateIsLoading] = useState(false);
  const [isActionLoading, updateActionLoading] = useState({} as any);
  const [installedApps, updateInstalledApps] = useState([] as InstalledApps[]);
  const [availableApps, updateAvailableApps] = useState([] as AppsAvailableForInstall[]);
  const [runningServices, updateRunningServices] = useState([] as RunningServices[]);
  const [appInfoMsg, updateAppInfoMsg] = useState("");
  const [selectedApp, updateSelectedApp] = useState({} as InstalledApps);
  const [installedVersion, updateInstalledVersion] = useState("");
  const [loadingSyncReleases, setLoadingSyncReleases] = useState(false);
  const [isInstallRubixAppModalVisible, updateIsInstallRubixAppModalVisible] = useState(false);
  const [app, setApp] = useState<InstalledApps | undefined>(undefined);
  const [isShowingLog, setIsShowingLog] = useState(false);

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

  const onSyncReleases = async () => {
    setLoadingSyncReleases(true);
    try {
      await GitDownloadReleases();
    } catch (error) {
      openNotificationWithIcon("error", error);
    } finally {
      setLoadingSyncReleases(false);
    }
  };

  if (appInfoMsg) {
    return (
      <span>
        {appInfoMsg}
        <span className="ml-3">
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <RbRefreshButton style={{width: '100px'}} refreshList={() => fetchAppInfo()} />
            <RbSyncButton style={{width: '150px'}} onClick={onSyncReleases} loading={loadingSyncReleases} text="Sync Releases" />
            <strong>App information unavailable, please re-synchronise releases before refresh app information. </strong>
          </div>
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

  const handleConfirm = async () => {
    if (app) {
      console.log(app)
      try {
        const res = await releaseFactory.EdgeDeleteAppDB(connUUID, hostUUID, app.app_name!);
        if (res) {
          console.log(res)
        }
      } catch (err) {
        console.log(err)
      } finally {
        fetchAppInfo();
        setApp(undefined)
      }
    }
  }

  const handleShowLog = (item: InstalledApps) => {
    console.log('show log for item: ', item)
    setIsShowingLog(true)
    setApp(item)
  }

  return (
    <>
    
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <RbRefreshButton style={{width: '100px'}} refreshList={() => fetchAppInfo()} />
          <RbSyncButton style={{width: '150px'}} onClick={onSyncReleases} loading={loadingSyncReleases} text="Sync Releases" />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh'}}>
          <List
            itemLayout="horizontal"
            loading={isLoading}
            bordered={true}
            dataSource={availableApps}
            header={<div style={{textAlign: 'start'}}><strong>Available Apps</strong></div>}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 16px", textAlign: 'start'}} >
                <DownloadOutlined onClick={() => setIsInstallRubixAppModalVisible(item)} className="ml-4 mr-10" />
                <span style={{ width: "430px" }}>
                  <div style={{display: 'flex', flexDirection: 'column', rowGap: '4px'}}>
                    <span>{item.app_name}</span>
                    <span style={{color: 'grey'}}>{`(${item.min_version || "Infinite"} - ${item.max_version || "Infinite"})`}</span>
                  </div>
                </span>
                <span
                  className="flex-1 italic"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    borderLeft: "1px solid #dfdfdf",
                    padding: "0 2rem",
                    color: 'grey'
                  }}
                >
                  <span style={{paddingTop: '15px', paddingBottom: '15px'}}>{`${item.description}`}</span>
                </span>
              </List.Item>
            )}
          />

          <List
            itemLayout="horizontal"
            loading={isLoading}
            bordered={true}
            dataSource={installedApps}
            header={<div style={{textAlign: 'start'}}><strong>Installed Apps</strong></div>}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 16px", textAlign: 'start' }}>
                <span className="mr-6" style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                  <Dropdown trigger={["click"]}
                            overlay={<ConfirmActionMenu item={item} onMenuClick={onMenuClick} hasUninstall={true} />}>
                    <Button icon={<EllipsisOutlined />} loading={isActionLoading[item.service_name || ""] || false} />
                  </Dropdown>

                  <Popconfirm
                    title={(
                      <div style={{display: 'flex', flexDirection: 'column', rowGap: '10px'}}>
                        <span style={{color: 'yellow'}}>Warning</span>
                        <span>This action will delete the database for app: <span style={{background: 'rgba(255,165,0,0.5)'}}>{`${item.app_name}`}</span>!  </span>
                      </div>
                    )}
                    onConfirm={handleConfirm}
                    okText="Confirm"
                    cancelText="Cancel"
                  >
                    <Button icon={<DeleteOutlined />} loading={isActionLoading[item.service_name || ""] || false} onClick={() => setApp(item)}/>
                  </Popconfirm>

                  <Button icon={<BookOutlined />} loading={isActionLoading[item.service_name || ""] || false} onClick={() => handleShowLog(item)}/>
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
            header={<div style={{textAlign: 'start'}}><strong>Running Services</strong></div>}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 16px", textAlign: 'start' }}>
                <span className="mr-6">
                  <Dropdown trigger={["click"]}
                            overlay={<ConfirmActionMenu item={item} onMenuClick={onMenuClick} hasUninstall={false} />}>
                    <Button icon={<EllipsisOutlined />} loading={isActionLoading[item.service_name || ""] || false} />
                  </Dropdown>
                </span>

                <span style={{ width: "432px" }}>{item.name}</span>
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
      </div>
      <AppLogModal 
        appName={app?.app_name} 
        connUUID={connUUID} 
        hostUUID={hostUUID} 
        isShowingLog={isShowingLog} 
        setIsShowingLog={setIsShowingLog}
      />
    </>
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
