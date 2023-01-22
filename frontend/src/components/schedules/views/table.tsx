import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import RbTable from "../../../common/rb-table";
import {
  SCHEDULES_HEADERS,
  SCHEDULES_SCHEMA,
} from "../../../constants/headers";
import { EditModal } from "./editModal"; 
import { ScheduleModal } from "./scheduleModal"; 
import { DeleteOutlined, EditOutlined, ScheduleOutlined } from '@ant-design/icons';
import { assistcli } from "../../../../wailsjs/go/models";

export const SchedulesTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const [currentItem, setCurrentItem] = useState({} as assistcli.Schedule);
  const [schema, setSchema] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const columns = [
    ...SCHEDULES_HEADERS,
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, schedule: assistcli.Schedule) => (
        <Space size="middle">
          <a
            onClick={() => {
              showEditModal(schedule);
            }}
          >
            <EditOutlined />
          </a>
          <a
            onClick={() => {
              showDeleteModal(schedule);
            }}
          >
            <DeleteOutlined />
          </a>
          <a
            onClick={() => {
              showScheduleModal(schedule);
            }}
          >
            <ScheduleOutlined />
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    props.setSelectedUUIDs(selectedRowKeys);
  }, [selectedRowKeys])

  useEffect(() => {
    props.setHasSelected(selectedRowKeys.length > 0);
  }, [selectedRowKeys.length])
  
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const showEditModal = (item: assistcli.Schedule) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle edit */
    setEditModalVisible(true)
  };

  const showDeleteModal = async(item: assistcli.Schedule) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle delete */
    const res = await props.factory.DeleteSchedule(props.connUUID, props.hostUUID, item.uuid)
    if (res) {
      refreshList()
    }
  };

  const showScheduleModal = (item: assistcli.Schedule) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle schedule */
    setScheduleModalVisible(true)
  };

  const handleEditFormFinish = async(value: any) => {
    const opts = {
      ...currentItem,
      name: value.schedule_name,
      enable: value.enable,
      is_active: value.is_active,
      is_global: value.is_global
    }

    await props.factory.EditSchedule(props.connUUID, props.hostUUID, currentItem.uuid, opts)
    
    setEditModalVisible(false);
    refreshList();
  }

  const handleEditCancel = () => {
    setEditModalVisible(false)
  }

  const handleScheduleCancel = () => {
    setScheduleModalVisible(false)
  }

  return (
    <>
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />

      <EditModal 
        createModal={editModalVisible} 
        moreOptions={true}
        handleFormFinish={handleEditFormFinish} 
        handleCancel={handleEditCancel}
      />

      <ScheduleModal
        visible={scheduleModalVisible} 
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        setScheduleModalVisible={setScheduleModalVisible}
        refreshList={refreshList}
        handleCancel={handleScheduleCancel}
        factory={props.factory}
        connUUID={props.connUUID}
        hostUUID={props.hostUUID}
      />
    </>
  );
};
