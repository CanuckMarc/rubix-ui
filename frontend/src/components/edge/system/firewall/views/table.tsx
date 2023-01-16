import { Button, Modal, Table, Spin, Space, Switch, Input } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { system } from "../../../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';

interface PortTableType {
  key: number;
  port: number;
  status: string;
}

export const Firewall = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [firewallList, setFirewallList] = useState([] as PortTableType[]);
  const [isFetching, setIsFetching] = useState(false);
  const [firewallStatus, setFirewallStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPort, setNewPort] = useState("")

  const handleOk = async () => {
    const body: system.UFWBody = {
      port: parseInt(newPort),
    }
    const msg = await factory.EdgeFirewallPortOpen(connUUID, hostUUID, body);
    console.log(msg);

    fetch();
    setNewPort("");
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setNewPort("");
    setIsModalOpen(false);
  };

  const factory = new HostFirewallFactory();

  const columns: ColumnsType<PortTableType> = [
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      fixed: "left"
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '30%'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '30%',
      render: ( text, record, index ) => {
        return (
          <Space size="middle">
            <Switch defaultChecked={record.status == 'open' ? true : false} onChange={onTogglePort(record)}/>
          </Space>
        )
      },
    }
  ]

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const status = await factory.EdgeFirewallStatus(connUUID, hostUUID);
      console.log(status.message)
      setFirewallStatus(status?.message == "firewall is enabled" ? true : false);
      console.log(firewallStatus)

      
      const list = await factory.EdgeFirewallList(connUUID, hostUUID);
      console.log(list)
      let mappedList: PortTableType[] = []
      if (list != null) {
        mappedList = list.map( item => {
          return {
            key: Date.now() + item.port,
            port: item.port,
            status: item.status
          }
        })
      }
      setFirewallList(mappedList);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onFirewallEnableToggle = async(checked: boolean) => {
    if (checked) {
      setFirewallStatus(true)
      await factory.EdgeFirewallEnable(connUUID, hostUUID)
      fetch();
    } else {
      setFirewallStatus(false)
      await factory.EdgeFirewallDisable(connUUID, hostUUID)
      fetch();
    }
  }

  const onTogglePort = (record: PortTableType) => async (checked: boolean) => {
    const body = new system.UFWBody({port: record.port})
    if (checked) {
      await factory.EdgeFirewallPortOpen(connUUID, hostUUID, body)
    } else {
      await factory.EdgeFirewallPortClose(connUUID, hostUUID, body)
    }

    fetch();
  }

  const addPort = () => {
    setIsModalOpen(true)
  }

  const onPortInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPort(event.target.value)
  }

  return (
    <>
      <div id="firewall-table-container">
        <Space align="center" direction="horizontal">
          <Button type="primary" icon={<ReloadOutlined />} size={"middle"} onClick={fetch}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={addPort}>
            Add port
          </Button>
        </Space>

        <Spin spinning={isFetching} style={{ width: '100%' }}>
          <Table id={"firewall-table"} columns={columns} dataSource={firewallList} 
            style={{ width: '100%' }}
            pagination={{
              position: ["bottomLeft"],
              showSizeChanger: true,
              pageSizeOptions: [10, 50, 100, 1000],
              locale: { items_per_page: "" },
            }}
            scroll={{ x: "max-content" }}/>
        </Spin>

        <Space align="center" direction="horizontal">
          <span>Enable firewall: </span>
          <Switch checked={firewallStatus} onChange={onFirewallEnableToggle} />
        </Space>
      </div>

      <Modal title="Add Port" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Space align="center" direction="horizontal">
          <span>Port number: </span>
          <Input value={newPort} onChange={onPortInputChange}/>
        </Space>
      </Modal>
    </>
  );
};
