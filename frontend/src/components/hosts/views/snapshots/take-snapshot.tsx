import { Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assistcli } from "../../../../../wailsjs/go/models";
import RbTable from "../../../../common/rb-table";
import { RbAddButton } from "../../../../common/rb-table-actions";
import { CREATE_LOGS_HEADERS } from "../../../../constants/headers";
import { openNotificationWithIcon } from "../../../../utils/utils";
import { SnapShotFactory } from "../../../edge/system/snapshot/factory";

import SnapshotCreateLog = assistcli.SnapshotCreateLog;

const { Title } = Typography;

export const TakeSnapshot = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState<SnapshotCreateLog[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new SnapShotFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.EdgeGetSnapshotsCreateLogs(connUUID, hostUUID);
      setData(res || []);
    } finally {
      setIsFetching(false);
    }
  };

  const create = async () => {
    const { message } = await factory.EdgeCreateSnapshot(connUUID, hostUUID);
    openNotificationWithIcon("success", message);
    fetch();
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <div className="d-flex mb-4">
        <RbAddButton handleClick={create} />
      </div>
      <Title level={4} style={{ textAlign: "left" }}>
        Created Logs
      </Title>
      <RbTable
        rowKey="uuid"
        dataSource={data}
        columns={CREATE_LOGS_HEADERS}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
