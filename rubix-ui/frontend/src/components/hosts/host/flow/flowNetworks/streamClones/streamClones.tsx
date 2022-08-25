import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { model } from "../../../../../../../wailsjs/go/models";
import { ROUTES } from "../../../../../../constants/routes";
import RbxBreadcrumb from "../../../../../breadcrumbs/breadcrumbs";
import { StreamClonesTable } from "./views/table";

const { Title } = Typography;

export const StreamClones = () => {
  const {
    connUUID = "",
    locUUID = "",
    netUUID = "",
    hostUUID = "",
  } = useParams();

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
      breadcrumbName: "Location Network",
    },
    {
      path: ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID),
      breadcrumbName: "Hosts",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Flow Networks",
    },
    {
      breadcrumbName: "Streams Clone",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Flow Network Streams Clone
      </Title>
      <RbxBreadcrumb routes={routes} />
      <StreamClonesTable />
    </>
  );
};
