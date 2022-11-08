import { Space, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
import { backend, storage } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbRefreshButton,
} from "../../../common/rb-table-actions";
import { CONNECTION_HEADERS } from "../../../constants/headers";
import { ROUTES } from "../../../constants/routes";
import { isObjectEmpty, openNotificationWithIcon } from "../../../utils/utils";
import { ConnectionFactory } from "../factory";
import { CreateEditModal } from "./create";
import { SnippetsOutlined } from "@ant-design/icons";
import { TokenModal } from "../../../common/token/token-modal";
import { RubixAssistTokenFactory } from "./token-factory";
import RubixConnection = storage.RubixConnection;
import UUIDs = backend.UUIDs;

export const ConnectionsTable = () => {
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [connections, setConnections] = useState([] as RubixConnection[]);
  const [currentConnection, setCurrentConnection] = useState(
    {} as RubixConnection
  );
  const [connectionSchema, setConnectionSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);

  const factory = new ConnectionFactory();

  const columns = [
    ...CONNECTION_HEADERS,
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, conn: RubixConnection) => (
        <Space size="middle">
          <Link to={ROUTES.LOCATIONS.replace(":connUUID", conn.uuid)}>
            View
          </Link>
          <a
            onClick={() => {
              showModal(conn);
            }}
          >
            Edit
          </a>
          <a
            onClick={() => {
              pingConnection(conn.uuid);
            }}
          >
            Ping
          </a>
          <Tooltip title="Tokens">
            <a
              onClick={(e) => {
                showTokenModal(conn, e);
              }}
            >
              <SnippetsOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetch();
  }, []);

  const showTokenModal = (connection: RubixConnection, e: any) => {
    e.stopPropagation();
    setCurrentConnection(connection);
    setIsTokenModalVisible(true);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = (await factory.GetAll()) || [];
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

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const pingConnection = (uuid: string) => {
    PingRubixAssist(uuid).then((ok) => {
      if (ok) {
        openNotificationWithIcon("success", `ping success`);
      } else {
        openNotificationWithIcon("error", `ping fail`);
      }
    });
    fetch();
  };

  const onCloseTokenModal = () => {
    setIsTokenModalVisible(false);
    setCurrentConnection({} as RubixConnection);
  };

  const tokenFactory: RubixAssistTokenFactory = new RubixAssistTokenFactory();
  useEffect(() => {
    tokenFactory.connectionUUID = currentConnection.uuid;
  }, [currentConnection]);

  return (
    <div>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as RubixConnection)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbTable
        rowKey="uuid"
        dataSource={connections}
        rowSelection={rowSelection}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        connections={connections}
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
      />
    </div>
  );
};
