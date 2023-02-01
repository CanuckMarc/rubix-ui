import {
  NodeIndexOutlined,
  HomeOutlined,
  ScheduleOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  ClusterOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import eventEmit from "../rubix-flow/util/evenEmit";

let ObjectType = {
  CONNECTIONS: "Connections",
  LOCATIONS: "locations",
  NETWORKS: "networks",
  HOSTS: "hosts",
  RUBIX_FLOW_REMOTE: "rubix-flow",
  WIRES_CONNECTIONS_REMOTE: "wires-connections",
  SCHEDULES_REMOTE: "schedules",
};

interface ObjectTypeRoute {
  [objectType: string]: (connUUID?: string, locUUID?: string, netUUID?: string, hostUUID?: string) => string;
}

let ObjectTypesToRoutes: ObjectTypeRoute = {
  [ObjectType.CONNECTIONS]: (connUUID: string = "") => ROUTES.LOCATIONS.replace(":connUUID", connUUID),
  [ObjectType.LOCATIONS]: (connUUID: string = "", locUUID: string = "") =>
    ROUTES.LOCATION_NETWORKS.replace(":connUUID", connUUID).replace(":locUUID", locUUID),
  [ObjectType.NETWORKS]: (connUUID: string = "", locUUID: string = "", netUUID: string = "") =>
    ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID),
  [ObjectType.HOSTS]: (connUUID: string = "", locUUID: string = "", netUUID: string = "", hostUUID: string = "") =>
    ROUTES.HOST.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID),
  [ObjectType.RUBIX_FLOW_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.RUBIX_FLOW_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.WIRES_CONNECTIONS_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.WIRES_CONNECTIONS_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.SCHEDULES_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.SCHEDULES_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
};

function getItemValue(item: any, type: string) {
  let itemC = { ...item };
  let deleteProp = "";
  switch (type) {
    case ObjectType.CONNECTIONS:
      deleteProp = ObjectType.LOCATIONS;
      break;
    case ObjectType.LOCATIONS:
      deleteProp = ObjectType.NETWORKS;
      break;
    case ObjectType.HOSTS:
    case ObjectType.RUBIX_FLOW_REMOTE:
    case ObjectType.WIRES_CONNECTIONS_REMOTE:
    case ObjectType.SCHEDULES_REMOTE:
    default:
      deleteProp = "";
      break;
  }
  if (deleteProp) delete itemC[deleteProp];

  return itemC;
}

interface RubixObjectI {
  name: string;
  uuid: string;
  connections?: any;
  locations?: any;
  networks?: any;
  hosts?: any;
}

const isActionLoading = {} as any;

const handleOpenAllMenus = (e: React.MouseEvent, next: string, isOpen: any) => {
  e.preventDefault();
  e.stopPropagation();
  eventEmit.dispatch("openAllMenus", { key: next, isOpen });
};

const getTreeObject = (item: any, next: string | undefined, prependName?: string, icon?: any) => {
  if (!next) {
    return {
      name: item.name,
      label: (
        <span style={{ padding: "10px 0" }}>
          <span style={{ fontWeight: 200, fontSize: 12, paddingRight: 5 }}>{prependName}</span>
          {item.name}
        </span>
      ),
      key: item.uuid,
      icon,
    };
  } else {
    const isFromSupervisor = next.split("/").length < 5 && next.split("/")[1] === "connections";
    return {
      name: item.name,
      label: (
        <NavLink to={next} style={{ color: "unset", display: "flex" }}>
          {prependName && <span style={{ fontWeight: 200, fontSize: 12, paddingRight: 5 }}>{prependName}</span>}
          <span style={{ width: "100%" }}>
            {item.name}
            {isFromSupervisor && (
              <MenuOutlined
                style={{ float: "right", marginTop: "13px", marginRight: "12px" }}
                onClick={(e) => handleOpenAllMenus(e, next, (isActionLoading[item.name] = !isActionLoading[item.name]))}
              />
            )}
          </span>
        </NavLink>
      ),
      key: next,
      icon,
    };
  }
};

type TreeObj = {
  name: any;
  label: JSX.Element;
  key: any;
  icon: any;
};

const objectMap = (treeObj: TreeObj) => {
  treeObj.label = (
    <Tooltip placement="right" title={treeObj.name}>
      {treeObj.label}
    </Tooltip>
  );
  return treeObj;
};

export const getTreeDataIterative = (connections: any) => {
  return [
    {
      ...objectMap(getTreeObject({ name: "Supervisors", uuid: "connections" }, ROUTES.CONNECTIONS, "")),
      next: ROUTES.CONNECTIONS,
      children: connections.map((connection: RubixObjectI) => ({
        ...objectMap(
          getTreeObject(connection, ObjectTypesToRoutes[ObjectType.CONNECTIONS](connection.uuid), "", <HomeOutlined />)
        ),
        next: ObjectTypesToRoutes[ObjectType.CONNECTIONS](connection.uuid),
        value: getItemValue(connection, ObjectType.CONNECTIONS),
        children: (connection.locations || []).map((location: RubixObjectI) => ({
          ...objectMap(
            getTreeObject(
              location,
              ObjectTypesToRoutes[ObjectType.LOCATIONS](connection.uuid, location.uuid),
              "",
              <HeatMapOutlined />
            )
          ),
          next: ObjectTypesToRoutes[ObjectType.LOCATIONS](connection.uuid, location.uuid),
          value: getItemValue(location, ObjectType.LOCATIONS),
          children: (location.networks || []).map((network: RubixObjectI) => ({
            ...objectMap(
              getTreeObject(
                network,
                ObjectTypesToRoutes[ObjectType.NETWORKS](connection.uuid, location.uuid, network.uuid),
                "",
                <LaptopOutlined />
              )
            ),
            next: ObjectTypesToRoutes[ObjectType.NETWORKS](connection.uuid, location.uuid, network.uuid),
            value: getItemValue(network, ObjectType.NETWORKS),
            children: (network.hosts || []).map((host: RubixObjectI) => ({
              ...objectMap(
                getTreeObject(
                  { ...host, name: host.name + " (device)" },
                  ObjectTypesToRoutes[ObjectType.HOSTS](connection.uuid, location.uuid, network.uuid, host.uuid),
                  "",
                  <ClusterOutlined />
                )
              ),
              next: ObjectTypesToRoutes[ObjectType.HOSTS](connection.uuid, location.uuid, network.uuid, host.uuid),
              value: getItemValue(host, ObjectType.HOSTS),
              children: [
                {
                  ...objectMap(
                    getTreeObject(
                      {
                        name: "wires",
                        uuid:
                          ObjectTypesToRoutes[ObjectType.HOSTS](
                            connection.uuid,
                            location.uuid,
                            network.uuid,
                            host.uuid
                          ) + "_wires",
                      },
                      undefined,
                      "",
                      <NodeIndexOutlined />
                    )
                  ),
                  next: ObjectTypesToRoutes[ObjectType.RUBIX_FLOW_REMOTE](connection.uuid, host.uuid),
                  value: getItemValue(host, ObjectType.RUBIX_FLOW_REMOTE),
                  children: [
                    {
                      ...objectMap(
                        getTreeObject(
                          { name: "sheet", uuid: "flow_" + host.uuid },
                          ObjectTypesToRoutes[ObjectType.RUBIX_FLOW_REMOTE](connection.uuid, host.uuid),
                          "",
                          <ClusterOutlined />
                        )
                      ),
                      next: ObjectTypesToRoutes[ObjectType.RUBIX_FLOW_REMOTE](connection.uuid, host.uuid),
                      value: getItemValue(host, ObjectType.RUBIX_FLOW_REMOTE),
                      children: null,
                    },
                    {
                      ...objectMap(
                        getTreeObject(
                          { name: "connections", uuid: "wires_connections_" + host.uuid },
                          ObjectTypesToRoutes[ObjectType.WIRES_CONNECTIONS_REMOTE](connection.uuid, host.uuid),
                          "",
                          <ClusterOutlined />
                        )
                      ),
                      next: ObjectTypesToRoutes[ObjectType.WIRES_CONNECTIONS_REMOTE](connection.uuid, host.uuid),
                      value: getItemValue(host, ObjectType.WIRES_CONNECTIONS_REMOTE),
                      children: null,
                    },
                  ],
                },
                {
                  ...objectMap(
                    getTreeObject(
                      { name: "schedules", uuid: "schedules_" + host.uuid },
                      ObjectTypesToRoutes[ObjectType.SCHEDULES_REMOTE](connection.uuid, host.uuid),
                      "",
                      <ScheduleOutlined />
                    )
                  ),
                  next: ObjectTypesToRoutes[ObjectType.SCHEDULES_REMOTE](connection.uuid, host.uuid),
                  value: getItemValue(host, ObjectType.SCHEDULES_REMOTE),
                  children: null,
                },
              ],
            })),
          })),
        })),
      })),
    },
  ];
};
