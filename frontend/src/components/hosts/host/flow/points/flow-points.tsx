import { Typography, Card, Tabs, Button } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FlowPointFactory } from "./factory";
import { BacnetFactory } from "../bacnet/factory";
import { ROUTES } from "../../../../../constants/routes";
import { model } from "../../../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import RbxBreadcrumb from "../../../../breadcrumbs/breadcrumbs";
import { FLOW_POINT_HEADERS } from "../../../../../constants/headers";
import { PLUGINS } from "../../../../../constants/plugins";
import { RbRefreshButton } from "../../../../../common/rb-table-actions";
import { BacnetWhoIsTable } from "../bacnet/table";
import { FlowPointsTable } from "./views/table";
import { FlowDeviceFactory } from "../devices/factory";
import { useSettings } from "../../../../settings/use-settings";
import useTitlePrefix from "../../../../../hooks/usePrefixedTitle";
import { setDataLocalStorage } from "../flow-service";
import Point = model.Point;

const flowDeviceFactory = new FlowDeviceFactory();

const { TabPane } = Tabs;
const { Title } = Typography;

const points = "POINTS";
const discover = "DISCOVER";

export const FlowPoints = () => {
  const {
    locUUID = "",
    netUUID = "",
    connUUID = "",
    hostUUID = "",
    deviceUUID = "",
    pluginName = "",
    networkUUID = "",
  } = useParams();
  const { prefixedTitle, addPrefix } = useTitlePrefix("Points");
  const [settings] = useSettings();
  const [data, setPoints] = useState([] as Point[]);
  const [discoveries, setDiscoveries] = useState([] as Point[]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingDiscoveries, setIsFetchingDiscoveries] = useState(false);

  const flowPointFactory = new FlowPointFactory();
  const bacnetFactory = new BacnetFactory();
  flowPointFactory.connectionUUID = bacnetFactory.connectionUUID = flowDeviceFactory.connectionUUID = connUUID;
  flowPointFactory.hostUUID = bacnetFactory.hostUUID = flowDeviceFactory.hostUUID = hostUUID;
  flowDeviceFactory.uuid = deviceUUID;

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
      breadcrumbName: "Controllers",
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
    {
      path: "",
      breadcrumbName: "Points",
    },
  ];

  const startInterval = () => {
    if (settings.auto_refresh_enable && settings.auto_refresh_rate && settings.auto_refresh_rate !== 0) {
      const intervalId = setInterval(() => {
        fetch();
      }, settings.auto_refresh_rate);
      return intervalId;
    }
  };

  const stopInterval = (intervalId: any) => {
    clearInterval(intervalId);
  };

  const fetch = async () => {
    const res = (await flowPointFactory.GetPointsForDevice(deviceUUID)) || [];
    setPoints(res);
    setDataLocalStorage(res); //handle mass edit
  };

  const runDiscover = async () => {
    try {
      setIsFetchingDiscoveries(true);
      const res = await bacnetFactory.DiscoverDevicePoints(deviceUUID, false, false);
      if (res) {
        openNotificationWithIcon("success", `discoveries: ${res.length}`);
      }
      setDiscoveries(res);
    } catch (error) {
      openNotificationWithIcon("error", `discovery error: ${error}`);
    } finally {
      setIsFetchingDiscoveries(false);
    }
  };

  const addPoints = async (selectedUUIDs: Array<Point>) => {
    await flowPointFactory.AddBulk(selectedUUIDs);
    fetchWithSpinningWheel();
  };

  const fetchWithSpinningWheel = async () => {
    try {
      setIsFetching(true);
      await fetch();
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchWithSpinningWheel();
    flowDeviceFactory.GetOne(false).then((flowDevice) => {
      if (flowDevice) addPrefix(flowDevice.name);
    });
  }, []);

  useEffect(() => {
    const interval = startInterval();
    return () => stopInterval(interval);
  }, [settings.auto_refresh_enable, settings.auto_refresh_rate]); //handle auto refresh points

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey={points}>
          <TabPane tab={points} key={points}>
            <RbRefreshButton refreshList={fetchWithSpinningWheel} />
            <FlowPointsTable
              data={data}
              isFetching={isFetching}
              pluginName={pluginName}
              refreshList={fetchWithSpinningWheel}
            />
          </TabPane>
          {pluginName === PLUGINS.bacnetmaster ? (
            <TabPane tab={discover} key={discover}>
              <Button type="primary" onClick={runDiscover} style={{ margin: "0 6px 10px 0", float: "left" }}>
                <RedoOutlined /> Discover
              </Button>
              <BacnetWhoIsTable
                refreshDeviceList={fetchWithSpinningWheel}
                data={discoveries}
                isFetching={isFetchingDiscoveries}
                handleAdd={addPoints}
                addBtnText="Create Points"
                headers={FLOW_POINT_HEADERS}
              />
            </TabPane>
          ) : null}
        </Tabs>
      </Card>
    </>
  );
};
