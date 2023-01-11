import { Button, Descriptions, Modal, Spin, Space } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined } from '@ant-design/icons';

export const Firewall = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState({} as any);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new HostFirewallFactory();
//   factory.connectionUUID = connUUID;
//   factory.hostUUID = hostUUID;

//   useEffect(() => {
//     fetch();
//   }, []);

//   const fetch = async () => {
//     try {
//       setIsFetching(true);
//       const res = await factory.GetHostTime();
//       setData(res);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setIsFetching(false);
//     }
//   };

  return (
    <>
      <Space align="start" direction="vertical">
        <Button type="primary" icon={<ReloadOutlined />} size={"middle"}>Refresh</Button>
        <Spin spinning={isFetching}>
         
        </Spin>
      </Space>
    </>
  );
};
