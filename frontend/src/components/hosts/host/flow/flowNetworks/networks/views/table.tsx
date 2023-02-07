import { Space, Spin, Tooltip } from "antd";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import RbTable from "../../../../../../../common/rb-table";
import { RbRefreshButton, RbAddButton, RbDeleteButton } from "../../../../../../../common/rb-table-actions";
import { FLOW_NETWORKS_HEADERS } from "../../../../../../../constants/headers";
import { ROUTES } from "../../../../../../../constants/routes";
import { FlowFrameworkNetworkFactory } from "../factory";
import { CreateEditModal } from "./create";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";

import UUIDs = backend.UUIDs;
import FlowNetwork = model.FlowNetwork;

export const FlowNetworksTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [filteredData, setFilteredData] = useState(data);
  const [currentNetwork, setCurrentNetwork] = useState({} as FlowNetwork);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const factory = new FlowFrameworkNetworkFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      key: "actions",
      title: "Actions",
      fixed: "left",
      render: (_: any, network: FlowNetwork) => (
        <Space size="middle">
          <Link to={getNavigationLink(network.uuid)}>
            <Tooltip title="View Streams">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
          <Tooltip title="Edit">
            <a onClick={() => showModal(network)}>
              <FormOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    ...FLOW_NETWORKS_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const getNavigationLink = (flNetworkUUID: string): string => {
    return ROUTES.STREAMS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkUUID", flNetworkUUID);
  };

  const showModal = (network: FlowNetwork) => {
    setCurrentNetwork(network);
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentNetwork({} as FlowNetwork);
  };

  return (
    <>
      <RbRefreshButton refreshList={refreshList} />
      <RbAddButton handleClick={() => showModal({} as FlowNetwork)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        currentItem={currentNetwork}
        isModalVisible={isModalVisible}
        refreshList={refreshList}
        onCloseModal={onCloseModal}
      />
    </>
  );
};
