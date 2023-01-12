import { Button, Modal, Table, Spin, Space, Switch, Input } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostFirewallFactory } from "../factory";
import { ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { system, ufw } from "../../../../../../wailsjs/go/models";
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

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [firewallStatus, setFirewallStatus] = useState(false);
  const [selectedRow, setSelectedRow] = useState({} as PortTableType)
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPort, setNewPort] = useState("")


  const handleOk = () => {
    const newData = [...firewallList, {
      key: Date.now() + Number(newPort),
      port: Number(newPort),
      status: "close"
    }]
    setFirewallList(newData)
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
      // width: '20vw',
      fixed: "left"
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      // width: '20vw'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      // width: '20vw',
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
      const status = await factory.EdgeFirewallStatus(connUUID, hostUUID);
      
      if (status != null) {
        // TODO: just guessing the message content
        setFirewallStatus(status.message == "open" ? true : false);
      }
      
      const list = await factory.EdgeFirewallList(connUUID, hostUUID);
      let mappedList: PortTableType[] = []
      if (list != null) {
        mappedList = list.map( item => {
          return {
            // TODO: need to test if this works with fetching a list
            key: Date.now() + item.port,
            port: item.port,
            status: item.status
          }
        })
      }
      setFirewallList(mappedList);
      console.log(mappedList)
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onFirewallEnableToggle = async(checked: boolean) => {
    if (checked) {
        await factory.EdgeFirewallEnable(connUUID, hostUUID)
    } else {
        await factory.EdgeFirewallDisable(connUUID, hostUUID)
    }
  }

  const onTogglePort = async (checked: boolean) => {
    console.log(checked)
    const body = new system.UFWBody({port: selectedRow.port})
    let res: ufw.Message
    if (checked) {
      res = await factory.EdgeFirewallPortOpen(connUUID, hostUUID, body)
    } else {
      res = await factory.EdgeFirewallPortClose(connUUID, hostUUID, body)
    }
    console.log(res);
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
    const filteredData = firewallList.filter(item => {
      let flag = false
      selectedRowKeys.forEach( (value, i) => {
        if (item.key == value) flag = true
      })
      return (flag == false) && item
    })
    setFirewallList(filteredData)
    setSelectedRowKeys([])
  }

  const addPort = () => {
    setIsModalOpen(true)
  }

  const onPortInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPort(event.target.value)
  }

  return (
    <>
      <Space align="start" direction="vertical" style={{ width: "100%" }}>
        <Space align="center" direction="horizontal">
          <Button type="primary" icon={<ReloadOutlined />} size={"middle"}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={addPort} loading={loading}>
            Add port
          </Button>
          <Button type="primary" danger={true} icon={<MinusOutlined />} onClick={deleteSelectedPorts} disabled={!hasSelected} loading={loading}>
            Delete port
          </Button>
        </Space>
        <Spin spinning={isFetching}>
          <Table columns={columns} dataSource={firewallList} rowSelection={rowSelection} style={{ tableLayout: "auto", width: "76.5vw" }}
            onRow={(row) => {
              return {
                onClick: () => {setSelectedRow(row)} // click row
              };
            }} 
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
          <Switch defaultChecked={firewallStatus} onChange={onFirewallEnableToggle} />
        </Space>
      </Space>

      <Modal title="Add Port" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Space align="center" direction="horizontal">
          <span>Port number: </span>
          <Input value={newPort} onChange={onPortInputChange}/>
        </Space>
      </Modal>
    </>
  );
};
