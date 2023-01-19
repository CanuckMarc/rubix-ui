import { useEffect, useState } from "react";
import { Typography, Card, Space, Button, Input, Modal, Form, Switch } from "antd";
import { SchedulesFactory } from "./factory";
import { useParams } from "react-router-dom";
import { SchedulesTable } from "./views/table";
import { EditModal } from "./views/editModal";
import {assistcli, model} from "../../../wailsjs/go/models";

import { ReloadOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Title } = Typography;

export const Schedules = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [createModal, showCreateModal] = useState(false);
  const [form] = Form.useForm();
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([]);

  const factory = new SchedulesFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetSchedules(connUUID, hostUUID);
      setData(res);
    } catch (error) {
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [connUUID, hostUUID]);

  const handleRefreshClick = () => {
    fetch();
  }

  const handleCreateClick = () => {
    showCreateModal(true)
  }

  const handleDeleteClick = () => {
    selectedUUIDs.forEach(async(value, index) => {
      const res = await factory.DeleteSchedule(connUUID, hostUUID, value);
      if (res) {
        fetch();
      }
    })
  }

  const handleFormFinish = async(value: any) => {
    showCreateModal(false)
    await factory.AddSchedules(connUUID, hostUUID, value.schedule_name)
    
    fetch();
  }

  const handleCancel = () => {
    showCreateModal(false)
  }

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Schedules
      </Title>
      <Card bordered={false}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2vh' }}>
          <Space direction="horizontal" align="center">
            <Button type="primary" icon={<ReloadOutlined />} size={'middle'} onClick={handleRefreshClick}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size={'middle'} onClick={handleCreateClick}>Create</Button>
            <Button type="primary" icon={<DeleteOutlined />} danger={true} size={'middle'} disabled={!hasSelected} onClick={handleDeleteClick}>Delete</Button>
            {/* <Search placeholder="input search text" allowClear onSearch={onSearch} size={'middle'} style={{ width: '20vw' }} /> */}
      
          </Space>

          <SchedulesTable 
            data={data} 
            isFetching={isFetching} 
            refreshList={fetch} 
            factory={factory}
            connUUID={connUUID}
            hostUUID={hostUUID}
            setHasSelected={setHasSelected}
            setSelectedUUIDs={setSelectedUUIDs}
          />

        </div>
      </Card>

      <EditModal 
        createModal={createModal} 
        moreOptions={false}
        handleFormFinish={handleFormFinish} 
        handleCancel={handleCancel}
      />
    </>
  );
};

export default Schedules;
