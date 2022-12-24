import { Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FlowStreamCloneFactory } from "../factory";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { ROUTES } from "../../../../../../../constants/routes";
import { STREAM_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import { RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";

import UUIDs = backend.UUIDs;
import StreamClone = model.StreamClone;

export const StreamClonesTable = () => {
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "", flNetworkCloneUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [streamClones, setStreamClones] = useState([] as StreamClone[]);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowStreamCloneFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, item: StreamClone) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>View Consumers</Link>
        </Space>
      ),
    },
    ...STREAM_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  useEffect(() => {
    fetch();
  }, []);

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
      setStreamClones(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={streamClones}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
