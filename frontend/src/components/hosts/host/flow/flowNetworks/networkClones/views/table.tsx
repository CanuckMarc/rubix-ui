import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { FlowFrameworkNetworkCloneFactory } from "../factory";
import { ROUTES } from "../../../../../../../constants/routes";
import { FLOW_NETWORKS_HEADERS } from "../../../../../../../constants/headers";
import { RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import RbTable from "../../../../../../../common/rb-table";

import UUIDs = backend.UUIDs;
import FlowNetworkClone = model.FlowNetworkClone;
import RbTableFilterNameInput from "../../../../../../../common/rb-table-filter-name-input";

export const NetworkClonesTable = (props: any) => {
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [networks, setNetworks] = useState([] as Array<UUIDs>);
  const [dataSource, setDataSource] = useState(networks);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowFrameworkNetworkCloneFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    {
      key: "name",
      title: "name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      filterDropdown: () => {
        return <RbTableFilterNameInput defaultData={networks} setFilteredData={setDataSource} />;
      },
    },
    ...FLOW_NETWORKS_HEADERS,
    {
      title: "actions",
      key: "actions",
      fixed: "right",
      render: (_: any, network: FlowNetworkClone) => (
        <Space size="middle">
          <Link to={getNavigationLink(network.uuid)}>View Streams</Link>
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
    fetch();
  }, []);

  useEffect(() => {
    return setDataSource(networks);
  }, [networks.length]);

  const getNavigationLink = (flNetworkCloneUUID: string): string => {
    return ROUTES.STREAMCLONES.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkCloneUUID", flNetworkCloneUUID);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = (await factory.GetAll(false)) || [];
      setNetworks(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    fetch();
  };

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
