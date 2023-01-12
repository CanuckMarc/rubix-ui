import { Button, Descriptions, Modal, Table, Spin, Space, Switch } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface PortTableType {
  key: string;
  port: string;
  status: string;
}

export const Firewall = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [firewallList, setFirewallList] = useState([] as any);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new HostFirewallFactory();

  const columns: ColumnsType<PortTableType> = [
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Switch defaultChecked={false} onChange={onTogglePort}/>
        </Space>
      ),
    }
  ]

  const data: PortTableType[] = [
    {
      key: '1',
      port: '3000',
      status: 'open'
    },
    {
      key: '2',
      port: '3001',
      status: 'close'
    }
  ];

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.EdgeFirewallList(connUUID, hostUUID);
      setFirewallList(res);
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

  const onTogglePort = (checked: boolean) => {
    console.log()
  }

  return (
    <>
      <Space align="start" direction="vertical">
        <Button type="primary" icon={<ReloadOutlined />} size={"middle"}>Refresh</Button>
        <Spin spinning={isFetching}>
          <Table columns={columns} dataSource={data} />
        </Spin>
        <Switch defaultChecked={false} onChange={onToggleChange} />
      </Space>
    </>
  );
};
