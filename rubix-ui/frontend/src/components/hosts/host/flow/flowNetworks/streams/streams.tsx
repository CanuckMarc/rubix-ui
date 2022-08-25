import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography } from "antd";
import { FlowStreamFactory } from "./factory";
import { model } from "../../../../../../../wailsjs/go/models";
import { ROUTES } from "../../../../../../constants/routes";
import RbxBreadcrumb from "../../../../../breadcrumbs/breadcrumbs";
import { StreamsTable } from "./views/table";

import Stream = model.Stream;

const { Title } = Typography;

export const Streams = () => {
  const {
    connUUID = "",
    locUUID = "",
    netUUID = "",
    hostUUID = "",
  } = useParams();
  const [streams, setStreams] = useState([] as Stream[]);
  const [isFetching, setIsFetching] = useState(false);

  let factory = new FlowStreamFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const routes = [
    {
      path: ROUTES.CONNECTIONS,
      breadcrumbName: "Supervisors",
    },
    {
      path: ROUTES.LOCATIONS.replace(":connUUID", connUUID || ""),
      breadcrumbName: "Location",
    },
    {
      path: ROUTES.LOCATION_NETWORKS.replace(
        ":connUUID",
        connUUID || ""
      ).replace(":locUUID", locUUID || ""),
      breadcrumbName: "Group",
    },
    {
      path: ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID),
      breadcrumbName: "Controllers",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Controllers",
    },
    {
      breadcrumbName: "Streams",
    },
  ];

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setStreams(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Flow Network Streams
      </Title>
      <RbxBreadcrumb routes={routes} />
      <StreamsTable
        data={streams}
        isFetching={isFetching}
        refreshList={fetch}
      />
    </>
  );
};
