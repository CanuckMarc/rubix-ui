import { Typography, Card } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { LocationFactory } from "../locations/factory";
import { NetworksTable } from "./views/table";
import useTitlePrefix from "../../hooks/usePrefixedTitle";

const { Title } = Typography;
let locationFactory = new LocationFactory();

export const Networks = () => {
  const { connUUID = "", locUUID = "" } = useParams();
  const { prefixedTitle, addPrefix } = useTitlePrefix("Locations");
  locationFactory.connectionUUID = connUUID;
  locationFactory.uuid = locUUID;

  useEffect(() => {
    locationFactory.GetOne().then((location) => {
      if (location) addPrefix(location.name);
    });
  }, []);

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
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <NetworksTable />
      </Card>
    </>
  );
};
