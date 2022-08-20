import { useEffect, useState } from "react";
import { isObjectEmpty } from "../../utils/utils";
import { ConnectionsTable } from "./views/table";
import { CreateEditModal } from "./views/create";
import { ConnectionFactory } from "./factory";
import {  Card, Tabs, Typography } from "antd";
import { ApartmentOutlined, RedoOutlined } from "@ant-design/icons";
import { storage } from "../../../wailsjs/go/models";
import { PcScanner } from "../pc/scanner/table";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { RbAddButton, RbRefreshButton } from "../../common/rb-table-actions";

const { Title } = Typography;

import RubixConnection = storage.RubixConnection;
import { ROUTES } from "../../constants/routes";

export const Connections = () => {
  const { TabPane } = Tabs;
  let factory = new ConnectionFactory();

  const [connections, setConnections] = useState([] as RubixConnection[]);
  const [currentConnection, setCurrentConnection] = useState(
    {} as RubixConnection
  );
  const [connectionSchema, setConnectionSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setIsFetching(true);
      let res = await factory.GetAll();
      res = !res ? [] : res;
      setConnections(res);
    } catch (error) {
      setConnections([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    const jsonSchema = {
      properties: res,
    };
    console.log(jsonSchema)
    setConnectionSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const refreshList = () => {
    fetchList();
  };

  const showModal = (connection: RubixConnection) => {
    setCurrentConnection(connection);
    setIsModalVisible(true);
    if (isObjectEmpty(connectionSchema)) {
      getSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentConnection({} as RubixConnection);
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Connections
      </Title>

      <Card bordered={false}>
        <RbxBreadcrumb
          routes={[{ path: ROUTES.CONNECTIONS, breadcrumbName: "Connections" }]}
        ></RbxBreadcrumb>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <ApartmentOutlined />
                Connections
              </span>
            }
            key="1"
          >
            <RbRefreshButton refreshList={refreshList} />
            <RbAddButton handleClick={() => showModal({} as RubixConnection)} />
            <ConnectionsTable
              connections={connections}
              isFetching={isFetching}
              showModal={showModal}
              refreshList={refreshList}
            />
            <CreateEditModal
              connections={connections}
              currentConnection={currentConnection}
              connectionSchema={connectionSchema}
              isModalVisible={isModalVisible}
              isLoadingForm={isLoadingForm}
              refreshList={refreshList}
              onCloseModal={onCloseModal}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <RedoOutlined />
                Discover
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
