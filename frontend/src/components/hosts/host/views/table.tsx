import { Button, Descriptions, Modal, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { amodel } from "../../../../../wailsjs/go/models";
import { HostSystemFactory } from "../../../edge/system/factory-system";
import { HostNetworking } from "../../../edge/system/networking/host-networking";
import { HostTime } from "../../../edge/system/time/host-time";
import { Firewall } from "../../../edge/system/firewall/views/table";
import { Bacnet } from "../../../edge/system/bacnet/views/modal";
import { HostsFactory } from "../../factory";
import Host = amodel.Host;

const { TabPane } = Tabs;

const info = "INFO";
const networking = "NETWORKING";
const time = "DATE/TIME";
const firewall = "FIREWALL";
const bacnet = "BACNET CONFIG";

const HostInfoSetting = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [host, setHost] = useState({} as Host);
  const [isFetching, setIsFetching] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);

  const hostSystemFactory = new HostSystemFactory();

  const hostFactory = new HostsFactory();
  hostFactory.connectionUUID = connUUID;
  hostFactory.uuid = hostUUID;

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await hostFactory.GetOne();
      setHost(res);
    } finally {
      setIsFetching(false);
    }
  };

  const rebootHost = async () => {
    try {
      setIsRebooting(true);
      await hostSystemFactory.EdgeHostReboot(connUUID, hostUUID);
    } finally {
      setIsRebooting(false);
    }
  };

  const warning = () => {
    Modal.confirm({
      title: "Confirm Are you sure?",
      content: "This will reboot the device",
      onOk() {
        return rebootHost();
      },
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Spin spinning={isFetching}>
      <Descriptions>
        <Descriptions.Item label="uuid">{host.uuid}</Descriptions.Item>
        <Descriptions.Item label="name">{host.name}</Descriptions.Item>
      </Descriptions>
      <div className="text-start mt-4">
        <Button type="primary" onClick={warning} loading={isRebooting} danger>
          Reboot Host
        </Button>
      </div>
    </Spin>
  );
};

export const HostTable = () => {
  return (
    <Tabs defaultActiveKey={info}>
      <TabPane tab={info} key={info}>
        <HostInfoSetting />
      </TabPane>
      <TabPane tab={networking} key={networking}>
        <HostNetworking />
      </TabPane>
      <TabPane tab={time} key={time}>
        <HostTime />
      </TabPane>
      <TabPane tab={firewall} key={firewall}>
        <Firewall />
      </TabPane>
      <TabPane tab={bacnet} key={bacnet}>
        <Bacnet />
      </TabPane>
    </Tabs>
  );
};
