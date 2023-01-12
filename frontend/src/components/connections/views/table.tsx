import { ArrowRightOutlined, FormOutlined, LinkOutlined, ScanOutlined } from "@ant-design/icons";
import { Space, Tooltip, Spin } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
import { storage, backend } from "../../../../wailsjs/go/models";
import { RbSearchInput } from "../../../common/rb-search-input";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton, RbDeleteButton } from "../../../common/rb-table-actions";
import { CONNECTION_HEADERS } from "../../../constants/headers";
import { ROUTES } from "../../../constants/routes";
import { isObjectEmpty, openNotificationWithIcon } from "../../../utils/utils";
import { TokenModal } from "../../../common/token/token-modal";
import { ConnectionFactory } from "../factory";
import { CreateEditModal } from "./create";
import { RubixAssistTokenFactory } from "./token-factory";

import RubixConnection = storage.RubixConnection;
import UUIDs = backend.UUIDs;

export const ConnectionsTable = ({ data, fetch, isFetching }: any) => {
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [filteredData, setFilteredData] = useState<RubixConnection[]>([]);
  const [currentConnection, setCurrentConnection] = useState({} as RubixConnection);
  const [connectionSchema, setConnectionSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);

  const factory = new ConnectionFactory();

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, conn: RubixConnection) => (
        <Space size="middle">
          <Tooltip title="Ping">
            <a onClick={() => pingConnection(conn.uuid)}>
              <LinkOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Edit">
            <a onClick={() => showModal(conn)}>
              <FormOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Tokens">
            <a onClick={(e) => showTokenModal(conn, e)}>
              <ScanOutlined />
            </a>
          </Tooltip>
          <Link to={ROUTES.LOCATIONS.replace(":connUUID", conn.uuid)}>
            <Tooltip title="View">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    ...CONNECTION_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const showTokenModal = (connection: RubixConnection, e: any) => {
    e.stopPropagation();
    setCurrentConnection(connection);
    setIsTokenModalVisible(true);
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    const jsonSchema = {
      properties: res,
    };
    setConnectionSchema(jsonSchema);
    setIsLoadingForm(false);
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

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    fetch();
  };

  const pingConnection = (uuid: string) => {
    PingRubixAssist(uuid).then((ok) => {
      if (ok) {
        openNotificationWithIcon("success", "rubix assist server accessible");
      } else {
        openNotificationWithIcon("error", "check rubix assist server");
      }
    });
    fetch().catch(console.error);
  };

  const onCloseTokenModal = () => {
    setIsTokenModalVisible(false);
    setCurrentConnection({} as RubixConnection);
  };

  const tokenFactory: RubixAssistTokenFactory = new RubixAssistTokenFactory();
  useEffect(() => {
    tokenFactory.connectionUUID = currentConnection.uuid;
  }, [currentConnection]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as RubixConnection)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {data.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        dataSource={filteredData}
        rowSelection={rowSelection}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        currentConnection={currentConnection}
        connectionSchema={connectionSchema}
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        refreshList={fetch}
        onCloseModal={onCloseModal}
      />
      <TokenModal
        isModalVisible={isTokenModalVisible}
        displayName={currentConnection.name}
        onCloseModal={onCloseTokenModal}
        factory={tokenFactory}
        selectedItem={currentConnection}
      />
    </div>
  );
};
