import { Typography, Tabs, Card } from "antd";
import { ApartmentOutlined, RedoOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { storage } from "../../../wailsjs/go/models";
import { ROUTES } from "../../constants/routes";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { PcScanner } from "../pc/scanner/table";
import { ConnectionFactory } from "./factory";
import { ConnectionsTable } from "./views/table";

import RubixConnection = storage.RubixConnection;

const { Title } = Typography;

const ConnectionsTab = () => {
  return (
    <span>
      <ApartmentOutlined />
      SUPERVISORS
    </span>
  );
};

const DiscoverTab = () => {
  return (
    <span>
      <RedoOutlined />
      DISCOVER
    </span>
  );
};

export const Connections = () => {
  const { TabPane } = Tabs;
  const [data, setData] = useState([] as RubixConnection[]);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new ConnectionFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = (await factory.GetAll()) || [];
      setData(res);
    } catch (error) {
      setData([]);
    } finally {
      setTimeout(() => {
        setIsFetching(false);
      }, 100);
    }
  };

  useEffect(() => {
    fetch().catch(console.error);
  }, []);

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Supervisors
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={[{ path: ROUTES.CONNECTIONS, breadcrumbName: "Supervisors" }]} />
        <Tabs defaultActiveKey="1">
          <TabPane tab={ConnectionsTab()} key="Connections">
            <ConnectionsTable fetch={fetch} isFetching={isFetching} data={data} />
          </TabPane>
          <TabPane tab={DiscoverTab()} key="Discover">
            <PcScanner refreshConnections={fetch} />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};
