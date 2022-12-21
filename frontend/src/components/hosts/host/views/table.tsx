import { Descriptions, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { amodel } from "../../../../../wailsjs/go/models";
import {
  HostNetworking
} from "../../../edge/system/networking/host-networking";
import { HostTime } from "../../../edge/system/time/host-time";
import { HostsFactory } from "../../factory";
import Host = amodel.Host;

const { TabPane } = Tabs;

const info = "INFO";
const networking = "NETWORKING";
const time = "DATE/TIME";

export const HostTable = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [host, setHost] = useState({} as Host);
  const [isFetching, setIsFetching] = useState(false);

  const hostFactory = new HostsFactory();
  hostFactory.connectionUUID = connUUID;
  hostFactory.uuid = hostUUID;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await hostFactory.GetOne();
      setHost(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Spin spinning={isFetching}>
      <Tabs defaultActiveKey={info}>
        <TabPane tab={info} key={info}>
          <Descriptions>
            <Descriptions.Item label="uuid">{host.uuid}</Descriptions.Item>
            <Descriptions.Item label="name">{host.name}</Descriptions.Item>
          </Descriptions>
        </TabPane>
        <TabPane tab={networking} key={networking}>
          <HostNetworking />
        </TabPane>
        <TabPane tab={time} key={time}>
          <HostTime />
        </TabPane>
      </Tabs>
    </Spin>
  );
};
