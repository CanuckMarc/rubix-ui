import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FlowFrameworkNetworkFactory } from "../factory";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { ROUTES } from "../../../../../../../constants/routes";
import { FLOW_NETWORKS_HEADERS, FLOW_NETWORKS_SCHEMA } from "../../../../../../../constants/headers";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import RbTable from "../../../../../../../common/rb-table";
import RbTableFilterNameInput from "../../../../../../../common/rb-table-filter-name-input";
import { CreateEditModal } from "./create";

import UUIDs = backend.UUIDs;
import FlowNetwork = model.FlowNetwork;

export const FlowNetworksTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [dataSource, setDataSource] = useState(data);
  const [schema, setSchema] = useState({});
  const [currentNetwork, setCurrentNetwork] = useState({} as FlowNetwork);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const factory = new FlowFrameworkNetworkFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    {
      key: "name",
      title: "name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      filterDropdown: () => <RbTableFilterNameInput defaultData={data} setFilteredData={setDataSource} />,
    },
    ...FLOW_NETWORKS_HEADERS,
    {
      title: "actions",
      key: "actions",
      fixed: "right",
      render: (_: any, network: FlowNetwork) => (
        <Space size="middle">
          <Link to={getNavigationLink(network.uuid)}>View Streams</Link>
          <a onClick={() => showModal(network)}>Edit</a>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  useEffect(() => {
    return setDataSource(data);
  }, [data.length]);

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const getSchema = () => {
    const schema = {
      properties: FLOW_NETWORKS_SCHEMA,
    };
    setSchema(schema);
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
    getSchema();
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
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        schema={schema}
        currentItem={currentNetwork}
        isModalVisible={isModalVisible}
        refreshList={refreshList}
        onCloseModal={onCloseModal}
      />
    </>
  );
};
