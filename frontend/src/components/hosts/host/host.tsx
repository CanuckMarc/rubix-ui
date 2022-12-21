import { Tabs, Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import RbxBreadcrumb from "../../breadcrumbs/breadcrumbs";
import { FlowNetworks } from "./flow/flowNetworks/networks/flow-networks";
import { FlowNetworkClones } from "./flow/flowNetworks/networkClones/network-clones";
import { FlowNetworkTable } from "./flow/networks/views/table";
import { Plugins } from "./flow/plugins/views/table";
import { HostTable } from "./views/table";
import useTitlePrefix from "../../../hooks/usePrefixedTitle";
import { useEffect } from "react";
import { HostsFactory } from "../factory";

const { TabPane } = Tabs;
const { Title } = Typography;

const infoKey = "SETTINGS";
const networksKey = "DRIVERS";
const pluginsKey = "MODULES";
const flownetworksKey = "NETWORKS";
const flownetworkClonesKey = "REMOTE/MAPPING NETWORK";

const hostFactory = new HostsFactory();

export const Host = () => {
  let {
    connUUID = "",
    hostUUID = "",
    locUUID = "",
    netUUID = "",
  } = useParams();
  const { prefixedTitle, addPrefix } = useTitlePrefix("Controller");
  hostFactory.uuid = hostUUID;
  hostFactory.connectionUUID = connUUID;
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
      path: ROUTES.LOCATION_NETWORKS.replace(
        ":connUUID",
        connUUID || ""
      ).replace(":locUUID", locUUID || ""),
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

  useEffect(() => {
    hostFactory.GetOne().then((host) => {
      if (host) addPrefix(host.name);
    });
  }, []);

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
          <TabPane tab={flownetworksKey} key={flownetworksKey}>
            <FlowNetworks />
          </TabPane>
          <TabPane tab={flownetworkClonesKey} key={flownetworkClonesKey}>
            <FlowNetworkClones />
          </TabPane>
          <TabPane tab={infoKey} key={infoKey}>
            <HostTable />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
