import { model } from "../../../../wailsjs/go/models";
import { Space, Spin, Table } from "antd";
import { DeleteHost } from "../../../../wailsjs/go/main/App";
import { openNotificationWithIcon } from "../../../utils/utils";

export const HostsTable = (props: any) => {
  const { hosts, networks, showModal, isFetching, connUUID, refreshList } =
    props;

  if (!hosts) return <></>;
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
      title: "Network",
      dataIndex: "network_uuid",
      key: "network_uuid",
      render: (network_uuid: string) => (
        <span>{getNetworkNameByUUID(network_uuid)}</span>
      ),
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
      render: (_: any, host: model.Host) => (
        <Space size="middle">
          <a
            onClick={() => {
              showModal(host);
            }}
          >
            Edit
          </a>
          <a
            onClick={() => {
              deleteHost(host.uuid);
            }}
          >
            Delete
          </a>
          <a
            onClick={() => {
              navigateToNewTab(host);
            }}
          >
            Rubix-Wires
          </a>
        </Space>
      ),
    },
  ];

  const deleteHost = async (uuid: string) => {
    await DeleteHost(connUUID, uuid);
    refreshList();
  };

  const getNetworkNameByUUID = (uuid: string) => {
    const network = networks.find((l: model.Location) => l.uuid === uuid);
    return network ? network.name : "";
  };

  const navigateToNewTab = (host: model.Host) => {
    try {
      const { ip } = host;
      const source = `https://${ip}.1313/`;
      window.open(source);
    } catch (err: any) {
      openNotificationWithIcon("error", err.message);
    }
  };

  return (
    <>
      <Table
        rowKey="uuid"
        dataSource={hosts}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
