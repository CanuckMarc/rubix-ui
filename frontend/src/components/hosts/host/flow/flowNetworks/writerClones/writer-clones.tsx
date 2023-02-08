import Title from "antd/lib/typography/Title";
import { useParams } from "react-router-dom";
import { ROUTES } from "../../../../../../constants/routes";
import RbxBreadcrumb from "../../../../../breadcrumbs/breadcrumbs";
import { WriterClonesTable } from "./views/table";

export const WriterClones = () => {
  const { connUUID = "", locUUID = "", netUUID = "", hostUUID = "", flNetworkUUID = "", streamUUID = "" } = useParams();

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
      path: ROUTES.PRODUCERS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || "")
        .replace(":flNetworkUUID", flNetworkUUID || "")
        .replace(":streamUUID", streamUUID || ""),
      breadcrumbName: "Producers",
    },
    {
      breadcrumbName: "Writer Clones",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Writer Clones
      </Title>
      <RbxBreadcrumb routes={routes} />
      <WriterClonesTable />
    </>
  );
};
