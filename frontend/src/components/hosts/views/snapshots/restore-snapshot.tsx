import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SnapShotFactory } from "../../../edge/system/snapshot/factory";
import { Spin, Typography } from "antd";
import RbTable from "../../../../common/rb-table";
import { RbRefreshButton, RbRestartButton } from "../../../../common/rb-table-actions";
import { SNAPSHOTS_HEADERS } from "../../../../constants/headers";
import { openNotificationWithIcon } from "../../../../utils/utils";
import { assistcli } from "../../../../../wailsjs/go/models";

import Snapshots = assistcli.Snapshots;

const { Title } = Typography;

export const RestoreSnapshot = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState<Snapshots[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<string | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new SnapShotFactory();

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKey(selectedRowKeys[0]);
    },
    type: "radio",
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.EdgeGetSnapshots(connUUID, hostUUID);
      setData(res || []);
    } finally {
      setIsFetching(false);
    }
  };

  const restore = async () => {
    if (selectedRowKey) {
      const { message } = await factory.EdgeRestoreSnapshot(connUUID, hostUUID, selectedRowKey);
      openNotificationWithIcon("success", message);
      fetch();
    } else {
      openNotificationWithIcon("warning", "please select one");
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <div className="d-flex mb-4">
        <RbRefreshButton refreshList={fetch} />
        <RbRestartButton handleClick={restore} text="Restore" />
      </div>
      <Title level={4} style={{ textAlign: "left" }}>
        Snapshots
      </Title>
      <RbTable
        rowKey="name"
        dataSource={data}
        columns={SNAPSHOTS_HEADERS}
        loading={{ indicator: <Spin />, spinning: isFetching }}
        rowSelection={rowSelection}
      />
    </>
  );
};
