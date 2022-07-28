import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  GetHostNetworks,
  GetHosts,
  GetHostSchema,
} from "../../../wailsjs/go/main/App";
import { isObjectEmpty } from "../../utils/utils";
import { AddButton, CreateEditModal } from "./views/create";
import { HostsTable } from "./views/table";
import { Tabs, Typography, Card } from "antd";
import { ApartmentOutlined, RedoOutlined } from "@ant-design/icons";
import { PcScanner } from "../pc/scanner/table";
import { assistmodel } from "../../../wailsjs/go/models";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { ROUTES } from "../../constants/routes";

const { Title } = Typography;

export const Hosts = () => {
  const { TabPane } = Tabs;
  let { connUUID = "", netUUID = "", locUUID = "" } = useParams();
  const location = useLocation() as any;
  // const connUUID = location.state.connUUID || c;
  const [hosts, setHosts] = useState([] as assistmodel.Host[]);
  const [networks, setNetworks] = useState([] as assistmodel.Network[]);
  const [currentHost, setCurrentHost] = useState({} as assistmodel.Host);
  const [hostSchema, setHostSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    if (networks.length === 0) {
      fetchNetworks();
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [netUUID]);

  const fetchList = async () => {
    try {
      setIsFetching(true);
      const res = (await GetHosts(connUUID))
        .filter((h) => h.network_uuid === netUUID)
        .map((h) => {
          console.log(h);
          h.enable = !h.enable ? false : h.enable;
          return h;
        });
      console.log(res);
      setHosts(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchNetworks = async () => {
    const res = await GetHostNetworks(connUUID);
    setNetworks(res);
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await GetHostSchema(connUUID);
    res.properties = {
      ...res.properties,
      network_uuid: {
        title: "network",
        type: "string",
        anyOf: networks.map((n: assistmodel.Network) => {
          return { type: "string", enum: [n.uuid], title: n.name };
        }),
        default: netUUID,
      },
    };
    setHostSchema(res);
    setIsLoadingForm(false);
  };

  const refreshList = () => {
    fetchList();
  };

  const showModal = (host: assistmodel.Host) => {
    setCurrentHost(host);
    setIsModalVisible(true);
    if (isObjectEmpty(hostSchema)) {
      getSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentHost({} as assistmodel.Host);
  };

  const routes = [
    {
      path: ROUTES.CONNECTIONS,
      breadcrumbName: "Connections",
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
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Hosts
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <ApartmentOutlined />
                HOSTS
              </span>
            }
            key="1"
          >
            <div style={{ textAlign: "end" }}>
              <AddButton showModal={showModal} />
            </div>
            <CreateEditModal
              hosts={hosts}
              currentHost={currentHost}
              hostSchema={hostSchema}
              isModalVisible={isModalVisible}
              isLoadingForm={isLoadingForm}
              connUUID={connUUID}
              refreshList={refreshList}
              onCloseModal={onCloseModal}
            />
            <HostsTable
              hosts={hosts}
              networks={networks}
              isFetching={isFetching}
              refreshList={refreshList}
              showModal={showModal}
              connUUID={connUUID}
              netUUID={netUUID}
              locUUID={locUUID}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <RedoOutlined />
                DISCOVER
              </span>
            }
            key="2"
          >
            <PcScanner />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
