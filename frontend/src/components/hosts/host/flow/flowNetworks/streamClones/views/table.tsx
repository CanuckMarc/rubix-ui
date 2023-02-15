import { Space, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FlowStreamCloneFactory } from "../factory";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { ROUTES } from "../../../../../../../constants/routes";
import { STREAM_CLONE_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import { RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { ArrowRightOutlined } from "@ant-design/icons";

import UUIDs = backend.UUIDs;
import StreamClone = model.StreamClone;
import { RbSearchInput } from "../../../../../../../common/rb-search-input";

export const StreamClonesTable = () => {
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "", flNetworkCloneUUID = "" } = useParams();
  const [isFetching, setIsFetching] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [streamClones, setStreamClones] = useState([] as StreamClone[]);
  const [filteredData, setFilteredData] = useState<StreamClone[]>([]);

  const config = {
    originData: streamClones,
    setFilteredData: setFilteredData,
  };

  const factory = new FlowStreamCloneFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;
  factory.flowNetworkCloneUUID = flNetworkCloneUUID;

  const columns = [
    {
      key: "actions",
      title: "Actions",
      fixed: "left",
      render: (_: any, item: StreamClone) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>
            <Tooltip title="View Consumers">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    ...STREAM_CLONE_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const getNavigationLink = (streamCloneUUID: string): string => {
    return ROUTES.CONSUMERS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkCloneUUID", flNetworkCloneUUID)
      .replace(":streamCloneUUID", streamCloneUUID);
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    fetch();
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setStreamClones(res?.stream_clones || []);
      setFilteredData(res?.stream_clones || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {streamClones?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={streamClones?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
