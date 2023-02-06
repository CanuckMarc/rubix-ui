import { Button, Dropdown, List, Menu, Modal, Typography, Card, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { amodel } from "../../../../wailsjs/go/models";
import { GetHostNetwork } from "../../../../wailsjs/go/backend/App";
import { EdgeAppInfo } from "./install-app-info"; 
import { HostTable } from "../host/views/table";
import { ROUTES } from "../../../constants/routes";
import RbxBreadcrumb from "../../breadcrumbs/breadcrumbs";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const detailsTag = 'App details'
const settingsTag = 'Settings'


export const AppDetails = () => {
    let { connUUID = "", netUUID = "", locUUID = "", hostUUID = "" } = useParams();
    const [isFetching, setIsFetching] = useState(false);
    const [hosts, setHosts] = useState([] as amodel.Host[]);

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
          breadcrumbName: "Controller",
        },
      ];

    useEffect(() => {
        fetchList()
    }, [])

    const fetchList = async () => {
        try {
          setIsFetching(true);
          const res = await GetHostNetwork(connUUID, netUUID)
          const filteredHost = res.hosts.filter((item: amodel.Host) => {
            if (item.uuid === hostUUID) return true
          })
          setHosts(filteredHost);
        } catch (error) {
          console.log(error);
        } finally {
          setIsFetching(false);
        }
    };

    return (
        <>
            <Title level={3} style={{ textAlign: "left" }}>
                App details
            </Title>
            <Card bordered={false}>
                <RbxBreadcrumb routes={routes} />
                <Tabs defaultActiveKey="1">
                    <TabPane tab={detailsTag} key={detailsTag}>
                        <EdgeAppInfo host={hosts[0]} />
                    </TabPane>

                    <TabPane tab={settingsTag} key={settingsTag}>
                        <HostTable />
                    </TabPane>

                </Tabs>
            </Card>
        </>
    )
}