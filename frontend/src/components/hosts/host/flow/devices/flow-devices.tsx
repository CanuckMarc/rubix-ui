import { Tabs, Typography, Card, Button } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {assistcli, model} from "../../../../../../wailsjs/go/models";
import { RbRefreshButton } from "../../../../../common/rb-table-actions";
import { BACNET_HEADERS } from "../../../../../constants/headers";
import { PLUGINS } from "../../../../../constants/plugins";
import { ROUTES } from "../../../../../constants/routes";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import RbxBreadcrumb from "../../../../breadcrumbs/breadcrumbs";
import { BacnetWhoIsTable } from "../bacnet/table";
import { BacnetFactory } from "../bacnet/factory";
import { FlowNetworkFactory } from "../networks/factory";
import { FlowDeviceFactory } from "./factory";
import { FlowDeviceTable } from "./views/table";
import useTitlePrefix from "../../../../../hooks/usePrefixedTitle";
import { setDataLocalStorage } from "../flow-service";
import Device = model.Device;
import {BacnetMasterWhois} from "../../../../../../wailsjs/go/backend/App";

const { TabPane } = Tabs;
const { Title } = Typography;

const devices = "DEVICES";
const bacnet = "BACNET";

export const FlowDevices = () => {
  const { connUUID = "", hostUUID = "", networkUUID = "", locUUID = "", netUUID = "", pluginName = "" } = useParams();
  const [pluginUUID, setPluginUUID] = useState<any>();
  const [data, setData] = useState([] as Device[]);
  const [whoIs, setWhoIs] = useState([] as Device[]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingWhoIs, setIsFetchingWhoIs] = useState(false);
  const { prefixedTitle, addPrefix } = useTitlePrefix("Flow Devices");

  const bacnetFactory = new BacnetFactory();
  const flowDeviceFactory = new FlowDeviceFactory();
  const flowNetworkFactory = new FlowNetworkFactory();
  flowDeviceFactory.connectionUUID = bacnetFactory.connectionUUID = flowNetworkFactory.connectionUUID = connUUID;
  flowDeviceFactory.hostUUID = bacnetFactory.hostUUID = flowNetworkFactory.hostUUID = hostUUID;

  const routes = [
    {
      path: ROUTES.CONNECTIONS,
      breadcrumbName: "Supervisors",
    },
    {
      path: ROUTES.LOCATIONS.replace(":connUUID", connUUID || ""),
      breadcrumbName: "Location",
    },
    {
      path: ROUTES.LOCATION_NETWORKS.replace(":connUUID", connUUID || "").replace(":locUUID", locUUID || ""),
      breadcrumbName: "Group",
    },
    {
      path: ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID),
      breadcrumbName: "Controllers",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Controller",
    },
    {
      path: ROUTES.DEVICES.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || "")
        .replace(":pluginName", pluginName || "")
        .replace(":networkUUID", networkUUID || ""),
      breadcrumbName: "Devices",
    },
  ];

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await flowNetworkFactory.GetOne(networkUUID, true);
      const devices = (res.devices || []) as Device[];
      setData(devices);
      setPluginUUID(res.plugin_conf_id);
      addPrefix(res.name);
      setDataLocalStorage(devices); //handle mass edit
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const runWhois = async () => {
    try {
      setIsFetchingWhoIs(true);
      let opts = new assistcli.WhoIsOpts
      const res = await bacnetFactory.BacnetMasterWhois(networkUUID, opts);
      if (res) {
        openNotificationWithIcon("success", `device count found: ${res.length}`);
      }
      setWhoIs(res);
    } catch (error) {
      console.log(error);
      openNotificationWithIcon("error", `discovery error: ${error}`);
    } finally {
      setIsFetchingWhoIs(false);
    }
  };

  const addDevices = async (selectedUUIDs: Array<Device>) => {
    await flowDeviceFactory.AddBulk(selectedUUIDs);
    fetch();
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey={devices}>
          <TabPane tab={devices} key={devices}>
            <RbRefreshButton refreshList={fetch} />
            <FlowDeviceTable data={data} pluginUUID={pluginUUID} isFetching={isFetching} refreshList={fetch} />
          </TabPane>
          {pluginName === PLUGINS.bacnetmaster ? (
            <TabPane tab={bacnet} key={bacnet}>
              <Button type="primary" onClick={runWhois} style={{ margin: "0 6px 10px 0", float: "left" }}>
                <RedoOutlined /> WHO-IS
              </Button>
              <BacnetWhoIsTable
                refreshDeviceList={fetch}
                data={whoIs}
                isFetching={isFetchingWhoIs}
                handleAdd={addDevices}
                addBtnText="Create Devices"
                headers={BACNET_HEADERS}
              />
            </TabPane>
          ) : null}
        </Tabs>
      </Card>
    </>
  );
};
