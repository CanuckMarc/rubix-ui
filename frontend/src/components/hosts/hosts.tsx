import { Card, Tabs, Typography } from "antd";
import { ApartmentOutlined, RedoOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GetHostNetworks, GetHosts } from "../../../wailsjs/go/backend/App";
import { ROUTES } from "../../constants/routes";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { PcScanner } from "../pc/scanner/table";
import { HostsTable } from "./views/table";
import useTitlePrefix from "../../hooks/usePrefixedTitle";
import { NetworksFactory } from "../hostNetworks/factory";
import { amodel } from "../../../wailsjs/go/models";

const { TabPane } = Tabs;
const { Title } = Typography;

const HostsTab = () => {
  return (
    <span>
      <ApartmentOutlined />
      HOSTS
    </span>
  );
};

const DiscoverTab = () => {
  return (
    <span>
      <RedoOutlined />
      DISCOVER
    </span>
  );
};

export const Hosts = () => {
  let { connUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [hosts, setHosts] = useState([] as amodel.Host[]);
  const [networks, setNetworks] = useState([] as amodel.Network[]);
  const [isFetching, setIsFetching] = useState(false);
  const { prefixedTitle, addPrefix } = useTitlePrefix("Controllers");

  const networksFactory = new NetworksFactory();
  networksFactory.uuid = netUUID;
  networksFactory.connectionUUID = connUUID;

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
  ];

  const fetchCurrentLocation = () => {
    networksFactory.GetOne().then((network) => {
      if (network) addPrefix(network.name);
    });
  };

  const fetchList = async () => {
    try {
      setIsFetching(true);
      const res = (await GetHosts(connUUID))
        .filter((h) => h.network_uuid === netUUID)
        .map((h) => {
          h.enable = !h.enable ? false : h.enable;
          return h;
        });
      setHosts(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchNetworks = async () => {
    const res = await GetHostNetworks(connUUID);
    setNetworks(res);
  };

  useEffect(() => {
    if (networks.length === 0) {
      fetchNetworks();
    }
    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    fetchList();
  }, [netUUID]);

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey="1">
          <TabPane tab={HostsTab()} key="1">
            <HostsTable hosts={hosts} networks={networks} isFetching={isFetching} refreshList={fetchList} />
          </TabPane>
          <TabPane tab={DiscoverTab()} key="2">
            <PcScanner refreshList={fetchList} />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
