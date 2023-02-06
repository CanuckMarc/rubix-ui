import { Space, Spin, Tooltip } from "antd";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import RbTable from "../../../../../../../common/rb-table";
import { RbRefreshButton, RbDeleteButton } from "../../../../../../../common/rb-table-actions";
import { FLOW_NETWORKS_HEADERS } from "../../../../../../../constants/headers";
import { ROUTES } from "../../../../../../../constants/routes";
import { FlowFrameworkNetworkCloneFactory } from "../factory";
import { ArrowRightOutlined } from "@ant-design/icons";

import UUIDs = backend.UUIDs;
import FlowNetworkClone = model.FlowNetworkClone;

export const NetworkClonesTable = () => {
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [networks, setNetworks] = useState([] as Array<UUIDs>);
  const [filteredData, setFilteredData] = useState(networks);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowFrameworkNetworkCloneFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const config = {
    originData: networks,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, network: FlowNetworkClone) => (
        <Space size="middle">
          <Link to={getNavigationLink(network.uuid)}>
            <Tooltip title="View Streams">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    {
      key: "name",
      title: "name",
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
      setFilteredData(res);
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

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {networks?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={networks?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
