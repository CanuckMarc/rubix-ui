import { Tabs, Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import RbxBreadcrumb from "../../breadcrumbs/breadcrumbs";
import { FlowNetworks } from "./flow/flowNetworks/networks/flow-networks";
import { FlowNetworkClones } from "./flow/flowNetworks/networkClones/network-clones";
import { FlowNetworkTable } from "./flow/networks/views/table";
import { FlowPluginsTable } from "./flow/plugins/views/table";
import { HostTable } from "./views/hostTable";

const { TabPane } = Tabs;
const { Title } = Typography;

const infoKey = "INFO";
const networksKey = "DRIVERS";
const pluginsKey = "MODULES";
const flownetworksKey = "NETWORKS";
const flownetworkClonesKey = "REMOTE/MAPPING NETWORK";

export const Host = () => {
  let {
    connUUID = "",
    hostUUID = "",
    locUUID = "",
    netUUID = "",
  } = useParams();

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

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Controllers
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey={networksKey}>
          <TabPane tab={networksKey} key={networksKey}>
            <FlowNetworkTable />
          </TabPane>
          <TabPane tab={pluginsKey} key={pluginsKey}>
            <FlowPluginsTable />
          </TabPane>
          <TabPane tab={infoKey} key={infoKey}>
            <HostTable />
          </TabPane>
          <TabPane tab={flownetworksKey} key={flownetworksKey}>
            <FlowNetworks />
          </TabPane>
          <TabPane tab={flownetworkClonesKey} key={flownetworkClonesKey}>
            <FlowNetworkClones />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
