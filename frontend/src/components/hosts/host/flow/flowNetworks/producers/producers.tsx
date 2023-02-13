import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { ROUTES } from "../../../../../../constants/routes";
import RbxBreadcrumb from "../../../../../breadcrumbs/breadcrumbs";
import { ProducersTable } from "./views/table";

const { Title } = Typography;

export const Producers = () => {
  const { connUUID = "", locUUID = "", netUUID = "", hostUUID = "", flNetworkUUID = "" } = useParams();

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
      path: ROUTES.LOCATION_NETWORKS.replace(":connUUID", connUUID || "").replace(":locUUID", locUUID || ""),
      breadcrumbName: "Group",
    },
    {
      path: ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID),
      breadcrumbName: "Devices",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Devices",
    },
    {
      path: ROUTES.STREAMS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || "")
        .replace(":flNetworkUUID", flNetworkUUID || ""),
      breadcrumbName: "Streams",
    },
    {
      breadcrumbName: "Producers",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Producers
      </Title>
      <RbxBreadcrumb routes={routes} />
      <ProducersTable />
    </>
  );
};
