import { Typography, Card } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../wailsjs/go/models";
import { RbRefreshButton } from "../../common/rb-table-actions";
import { FlowFactory } from "../rubix-flow/factory";
import { WiresConnectionsTable } from "./views/table";

import Connection = db.Connection;

const { Title } = Typography;

export const WiresConnections = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState([] as Connection[]);
  const [isFetching, setIsFetching] = useState(false);

  const isRemote = !!connUUID && !!hostUUID;
  const factory = new FlowFactory();

  useEffect(() => {
    fetch();
  }, [connUUID, hostUUID]);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = (await factory.GetWiresConnections(connUUID, hostUUID, isRemote)) || [];
      setData(res);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Wires Connections
      </Title>
      <Card bordered={false}>
        <RbRefreshButton refreshList={fetch} />
        <WiresConnectionsTable data={data} isFetching={isFetching} refreshList={fetch} />
      </Card>
    </>
  );
};

export default WiresConnections;
