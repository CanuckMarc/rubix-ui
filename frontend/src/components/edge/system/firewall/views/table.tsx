import { Button, Descriptions, Modal, Spin, Space, Switch } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined } from '@ant-design/icons';

export const Firewall = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState({} as any);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new HostFirewallFactory();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.EdgeFirewallList(connUUID, hostUUID);
      setData(res);
      console.log(res)
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

const onToggleChange = async(checked: boolean) => {
    if (checked) {
        await factory.EdgeFirewallEnable(connUUID, hostUUID)
    } else {
        await factory.EdgeFirewallDisable(connUUID, hostUUID)
    }
}

  return (
    <>
      <Space align="start" direction="vertical">
        <Button type="primary" icon={<ReloadOutlined />} size={"middle"}>Refresh</Button>
        <Spin spinning={isFetching}>
         
        </Spin>
        <Switch defaultChecked={false} onChange={onToggleChange} />
      </Space>
    </>
  );
};
