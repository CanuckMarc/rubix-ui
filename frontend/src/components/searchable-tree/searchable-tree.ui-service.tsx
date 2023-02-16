import {
  NodeIndexOutlined,
  HomeOutlined,
  ScheduleOutlined,
  HeatMapOutlined,
  LaptopOutlined,
  ClusterOutlined,
  RadarChartOutlined,
  MenuOutlined,
  ToolOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import eventEmit from "../rubix-flow/util/evenEmit";

interface ObjectTypeRoute {
  [objectType: string]: (connUUID?: string, locUUID?: string, netUUID?: string, hostUUID?: string) => string;
}

interface RubixObjectI {
  name: string;
  uuid: string;
  connections?: any;
  locations?: any;
  networks?: any;
  hosts?: any;
}

type TreeObj = {
  name: any;
  label: JSX.Element;
  key: any;
  icon: any;
};

let ObjectType = {
  CONNECTIONS: "Connections",
  LOCATIONS: "locations",
  NETWORKS: "networks",
  HOSTS: "hosts",
  APP_DETAILS: "app-details",
  RUBIX_FLOW_REMOTE: "rubix-flow",
  WIRES_CONNECTIONS_REMOTE: "wires-connections",
  SCHEDULES_REMOTE: "schedules",
  WIRES_MAP_REMOTE: "wires-map",
  LORAWAN_REMOTE: "lorawan",
};

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
  [ObjectType.APP_DETAILS]: (
    connUUID: string = "",
    locUUID: string = "",
    netUUID: string = "",
    hostUUID: string = ""
  ) =>
    ROUTES.APP_DETAILS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID),
  [ObjectType.RUBIX_FLOW_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.RUBIX_FLOW_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.WIRES_CONNECTIONS_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.WIRES_CONNECTIONS_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.SCHEDULES_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.SCHEDULES_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.WIRES_MAP_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.WIRES_MAP_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
  [ObjectType.LORAWAN_REMOTE]: (connUUID: string = "", hostUUID: string = "") =>
    ROUTES.LORAWAN_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID),
};

const className = "supervisors-menu";
const isActionLoading = {} as any;

const handleOpenAllMenus = (e: React.MouseEvent, next: string, isOpen: any) => {
  e.preventDefault(); //prevent navigate
  if (next === "/connections") {
    for (const key in isActionLoading) {
      isActionLoading[key] = isActionLoading["Supervisors"];
    }
  }
  eventEmit.dispatch("openAllMenus", { key: next, isOpen });
};

const preventDropdown = (e: React.MouseEvent) => {
  e.stopPropagation();
};

const getTreeObject = (item: any, next: string | undefined, prependName?: string, icon?: any) => {
  isActionLoading[item.name] = false;

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
    return {
      name: item.name,
      label: displayLabel(item.name, prependName, next),
      key: next,
      icon,
    };
  }
};

const objectMap = (treeObj: TreeObj) => {
  const isDisabledTooltip =
    treeObj.key && treeObj.key.split("/").length < 5 && treeObj.key.split("/")[1] === "connections";
  treeObj.label = isDisabledTooltip ? (
    <>{treeObj.label}</>
  ) : (
    <Tooltip placement="right" title={treeObj.name}>
      {treeObj.label}
    </Tooltip>
  );
  return treeObj;
};

const displayLabel = (name: string, prependName: string | undefined, link: string) => {
  const allowOpenAll = link.split("/").length < 5 && link.split("/")[1] === "connections";
  const splittedName = name.split("(device");
  if (splittedName.length < 2) {
    return (
      <NavLink to={link} style={{ color: "unset" }} onClick={preventDropdown}>
        {prependName && <span style={{ fontWeight: 200, fontSize: 12, paddingRight: 5 }}>{prependName}</span>}
        <span style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {name}
          {allowOpenAll && (
            <MenuOutlined
              style={{ float: "right", marginRight: "12px" }}
              onClick={(e) => handleOpenAllMenus(e, link, (isActionLoading[name] = !isActionLoading[name]))}
            />
          )}
        </span>
      </NavLink>
    );
  } else {
    const label = splittedName[0];
    return (
      <div onClick={preventDropdown}>
        <span style={{ cursor: "context-menu", marginRight: "5px" }}>
          {prependName && <span style={{ fontWeight: 200, fontSize: 12, paddingRight: 5 }}>{prependName}</span>}
          {label}
        </span>
        <NavLink to={link}>{"(device" + splittedName[1]}</NavLink>
      </div>
    );
  }
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
          children: (location.networks || []).map((network: RubixObjectI) => ({
            ...objectMap(
              getTreeObject(
                { ...network, name: network.name + " (devices)" },
                ObjectTypesToRoutes[ObjectType.NETWORKS](connection.uuid, location.uuid, network.uuid),
                "",
                <LaptopOutlined />
              )
            ),
            next: ObjectTypesToRoutes[ObjectType.NETWORKS](connection.uuid, location.uuid, network.uuid),
            children: (network.hosts || []).map((host: RubixObjectI) => ({
              ...objectMap(
                getTreeObject(
                  { ...host, name: host.name + " (device)" },
                  ObjectTypesToRoutes[ObjectType.APP_DETAILS](connection.uuid, location.uuid, network.uuid, host.uuid),
                  "",
                  <ClusterOutlined />
                )
              ),
              next: ObjectTypesToRoutes[ObjectType.APP_DETAILS](
                connection.uuid,
                location.uuid,
                network.uuid,
                host.uuid
              ),
              children: [
                {
                  ...objectMap(
                    getTreeObject(
                      { name: "drivers", uuid: "drivers_" + host.uuid },
                      ObjectTypesToRoutes[ObjectType.HOSTS](connection.uuid, location.uuid, network.uuid, host.uuid),
                      "",
                      <ToolOutlined />
                    )
                  ),
                  next: ObjectTypesToRoutes[ObjectType.HOSTS](connection.uuid, location.uuid, network.uuid, host.uuid),
                  children: null,
                },
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
                  next: ObjectTypesToRoutes[ObjectType.WIRES_CONNECTIONS_REMOTE](connection.uuid, host.uuid),
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
                      children: null,
                    },
                    {
                      ...objectMap(
                        getTreeObject(
                          { name: "point mapping", uuid: "wires_map_" + host.uuid },
                          ObjectTypesToRoutes[ObjectType.WIRES_MAP_REMOTE](connection.uuid, host.uuid),
                          "",
                          <RadarChartOutlined />
                        )
                      ),
                      next: ObjectTypesToRoutes[ObjectType.WIRES_MAP_REMOTE](connection.uuid, host.uuid),
                      children: null,
                    },
                  ],
                  className,
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
                  children: null,
                },
                {
                  ...objectMap(
                    getTreeObject(
                      { name: "lorawan", uuid: "lorawan_" + host.uuid },
                      ObjectTypesToRoutes[ObjectType.LORAWAN_REMOTE](connection.uuid, host.uuid),
                      "",
                      <WifiOutlined />
                    )
                  ),
                  next: ObjectTypesToRoutes[ObjectType.LORAWAN_REMOTE](connection.uuid, host.uuid),
                  children: null,
                },
              ],
              className,
            })),
            className,
          })),
        })),
        className:
          !connection.locations || connection.locations.length === 0 ? className + " disconnect-menu" : className,
      })),
    },
  ];
};
