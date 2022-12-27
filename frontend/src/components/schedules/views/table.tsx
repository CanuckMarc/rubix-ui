import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import RbTable from "../../../common/rb-table";
import {
  SCHEDULES_HEADERS,
  SCHEDULES_SCHEMA,
} from "../../../constants/headers";
import { db } from "../../../../wailsjs/go/models";

import Connection = db.Connection;

export const SchedulesTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<string>);
  const [currentItem, setCurrentItem] = useState({} as Connection);
  const [schema, setSchema] = useState({});

  const columns = [
    ...SCHEDULES_HEADERS,
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, connection: Connection) => (
        <Space size="middle">
          <a
            onClick={() => {
              showEditModal(connection);
            }}
          >
            Edit
          </a>
          <a
            onClick={() => {
              showDeleteModal(connection);
            }}
          >
            Delete
          </a>
          <a
            onClick={() => {
              showScheduleModal(connection);
            }}
          >
            Schedule
          </a>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRowKeys);
    },
  };

  const showEditModal = (item: Connection) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle edit */
  };

  const showDeleteModal = (item: Connection) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle delete */
  };

  const showScheduleModal = (item: Connection) => {
    setCurrentItem(item);
    const schema = {
      properties: SCHEDULES_SCHEMA,
    };
    setSchema(schema);
    /* Handle schedule */
  };

  return (
    <RbTable
      rowKey="uuid"
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      loading={{ indicator: <Spin />, spinning: isFetching }}
    />
  );
};
