import { Tabs, Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import { FlowNetworks } from "./flow/flowNetworks/networks/flow-networks";
import { FlowNetworkClones } from "./flow/flowNetworks/networkClones/network-clones";
import { FlowNetworkTable } from "./flow/networks/views/table";
import { Plugins } from "./flow/plugins/views/table";
import useTitlePrefix from "../../../hooks/usePrefixedTitle";
import { useEffect } from "react";
import { HostsFactory } from "../factory";

const { TabPane } = Tabs;
const { Title } = Typography;

const networksKey = "Drivers";
const pluginsKey = "Modules";
const flowNetworksKey = "Flow Networks";
const flowNetworkClonesKey = "Flow Network Clones";

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
