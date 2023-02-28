import { Tabs, Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import { FlowNetworks } from "./flow/flowNetworks/networks/flow-networks";
import { FlowNetworkClones } from "./flow/flowNetworks/networkClones/network-clones";
import { FlowNetworkTable } from "./flow/networks/views/table";
import { Plugins } from "./flow/plugins/views/table";
import useTitlePrefix from "../../../hooks/usePrefixedTitle";
import { useEffect, useState } from "react";
import { HostsFactory } from "../factory";
import { ROUTES } from "../../../constants/routes";
import RbxBreadcrumb from "../../breadcrumbs/breadcrumbs";

const { TabPane } = Tabs;
const { Title } = Typography;

export const networksKey = "Drivers";
export const pluginsKey = "Modules";
export const flowNetworksKey = "Flow Networks";
export const flowNetworkClonesKey = "Flow Network Clones";

const hostFactory = new HostsFactory();

export const Host = () => {
  const { connUUID = "", hostUUID = "", locUUID = "", netUUID = "" } = useParams();
  const [activeKey, setActiveKey] = useState(networksKey);
  const { prefixedTitle, addPrefix } = useTitlePrefix("Device");
  hostFactory.uuid = hostUUID;
  hostFactory.connectionUUID = connUUID;

  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  useEffect(() => {
    hostFactory.GetOne().then((host) => {
      if (host) addPrefix(host.name);
    });
  }, []);

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
      breadcrumbName: "Devices",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Device",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs activeKey={activeKey} onChange={onTabChange}>
          <TabPane tab={networksKey} key={networksKey}>
            <FlowNetworkTable activeKey={activeKey} />
          </TabPane>
          <TabPane tab={pluginsKey} key={pluginsKey}>
            <Plugins activeKey={activeKey} />
          </TabPane>
          <TabPane tab={flowNetworksKey} key={flowNetworksKey}>
            <FlowNetworks activeKey={activeKey} />
          </TabPane>
          <TabPane tab={flowNetworkClonesKey} key={flowNetworkClonesKey}>
            <FlowNetworkClones activeKey={activeKey} />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
