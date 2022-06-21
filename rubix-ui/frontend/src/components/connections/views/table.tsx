import { useNavigate } from "react-router-dom";
import { Space, Spin, Table } from "antd";
import { DeleteConnection } from "../../../../wailsjs/go/main/App";
import { storage } from "../../../../wailsjs/go/models";
import RubixConnection = storage.RubixConnection;

export const ConnectionsTable = (props: any) => {
  const { connections, refreshList, showModal, isFetching } = props;
  if (!connections) return <></>;

  const navigate = useNavigate();

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Address",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "Port",
      dataIndex: "port",
      key: "port",
    },
    {
      title: "uuid",
      dataIndex: "uuid",
      key: "uuid",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, conn: RubixConnection) => (
        <Space size="middle">
          <a onClick={() => navigate(`locations/${conn.uuid}`)}>View</a>
          <a
            onClick={() => {
              showModal(conn);
            }}
          >
            Edit
          </a>
          <a
            onClick={() => {
              deleteConnection(conn.uuid);
            }}
          >
            Delete
          </a>
        </Space>
      ),
    },
  ];

  const deleteConnection = async (uuid: string) => {
    await DeleteConnection(uuid);
    refreshList();
  };

  return (
    <div>
      <Table
        rowKey="uuid"
        dataSource={connections}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </div>
  );
};