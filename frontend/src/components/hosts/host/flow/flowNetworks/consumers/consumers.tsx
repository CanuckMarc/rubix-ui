import Title from "antd/lib/typography/Title";
import { useParams } from "react-router-dom";
import { ROUTES } from "../../../../../../constants/routes";
import RbxBreadcrumb from "../../../../../breadcrumbs/breadcrumbs";
import { ConsumersTable } from "./views/table";

export const Consumers = () => {
  const { connUUID = "", locUUID = "", netUUID = "", hostUUID = "", flNetworkCloneUUID = "" } = useParams();

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
      path: ROUTES.STREAMCLONES.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || "")
        .replace(":flNetworkCloneUUID", flNetworkCloneUUID || ""),
      breadcrumbName: "Streams Clone",
    },
    {
      breadcrumbName: "Consumers",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Consumers
      </Title>
      <RbxBreadcrumb routes={routes} />
      <ConsumersTable />
    </>
  );
};
