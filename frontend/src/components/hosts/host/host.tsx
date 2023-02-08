import { Tabs, Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import { FlowNetworks } from "./flow/flowNetworks/networks/flow-networks";
import { FlowNetworkClones } from "./flow/flowNetworks/networkClones/network-clones";
import { FlowNetworkTable } from "./flow/networks/views/table";
import { Plugins } from "./flow/plugins/views/table";
import useTitlePrefix from "../../../hooks/usePrefixedTitle";
import { useEffect } from "react";
import { HostsFactory } from "../factory";
import { ROUTES } from "../../../constants/routes";
import RbxBreadcrumb from "../../breadcrumbs/breadcrumbs";

const { TabPane } = Tabs;
const { Title } = Typography;

const networksKey = "Drivers";
const pluginsKey = "Modules";
const flowNetworksKey = "Flow Networks";
const flowNetworkClonesKey = "Flow Network Clones";

const hostFactory = new HostsFactory();

export const Host = () => {
  const { connUUID = "", hostUUID = "", locUUID = "", netUUID = "" } = useParams();
  const { prefixedTitle, addPrefix } = useTitlePrefix("Device");
  hostFactory.uuid = hostUUID;
  hostFactory.connectionUUID = connUUID;

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
      breadcrumbName: "Controllers",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Controller",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey={networksKey}>
          <TabPane tab={networksKey} key={networksKey}>
            <FlowNetworkTable />
          </TabPane>
          <TabPane tab={pluginsKey} key={pluginsKey}>
            <Plugins />
          </TabPane>
          <TabPane tab={flowNetworksKey} key={flowNetworksKey}>
            <FlowNetworks />
          </TabPane>
          <TabPane tab={flowNetworkClonesKey} key={flowNetworkClonesKey}>
            <FlowNetworkClones />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
