import { Button, Descriptions, Modal, Table, Spin, Space, Switch } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined, MinusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface PortTableType {
  key: number;
  port: string;
  status: string;
}

export const Firewall = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [firewallList, setFirewallList] = useState([] as any);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState(
    [
      {
        key: 0,
        port: '3000',
        status: 'open'
      },
      {
        key: 1,
        port: '3001',
        status: 'close'
      },
      {
        key: 2,
        port: '3000',
        status: 'open'
      },
      {
        key: 3,
        port: '3001',
        status: 'close'
      }
    ]
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

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
      render: () => (
        <Space size="middle">
          <Switch defaultChecked={false} onChange={onTogglePort}/>
        </Space>
      ),
    }
  ]

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

  const onTogglePort = (checked: boolean, event: Event) => {
    console.log(checked)

  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const deleteSelectedPorts = () => {
    console.log(selectedRowKeys)
    const filteredData = data.filter(item => {
      let flag = false
      selectedRowKeys.forEach( (value, i) => {
        if (item.key == value) flag = true
      })
      return (flag == false) && item
    })
    setData(filteredData)
    setSelectedRowKeys([])
  }

  return (
    <>
      <Space align="start" direction="vertical">
        <Space align="center" direction="horizontal">
          <Button type="primary" icon={<ReloadOutlined />} size={"middle"}>Refresh</Button>
          <Button type="primary" danger={true} icon={<MinusOutlined />} onClick={deleteSelectedPorts} disabled={!hasSelected} loading={loading}>
            Delete port
          </Button>
        </Space>
        <Spin spinning={isFetching}>
          <Table columns={columns} dataSource={data} rowSelection={rowSelection} onRow={(rowIndex) => {
            return {
              onClick: () => {console.log(rowIndex)} // click row
            };
          }}/>
        </Spin>
        <Switch defaultChecked={false} onChange={onToggleChange} />
      </Space>
    </>
  );
};
