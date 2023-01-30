import { ArrowRightOutlined, FormOutlined, ImportOutlined, PhoneOutlined, ScanOutlined } from "@ant-design/icons";
import { Space, Tooltip, Spin, Menu, Button, Dropdown, MenuProps } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
import { storage, backend } from "../../../../wailsjs/go/models";
import { RbSearchInput } from "../../../common/rb-search-input";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton, RbDeleteButton, RbExportButton } from "../../../common/rb-table-actions";
import { CONNECTION_HEADERS } from "../../../constants/headers";
import { ROUTES } from "../../../constants/routes";
import { isObjectEmpty, openNotificationWithIcon } from "../../../utils/utils";
import { TokenModal } from "../../../common/token/token-modal";
import { ConnectionFactory } from "../factory";
import { CreateEditModal } from "./create";
import { RubixAssistTokenFactory } from "./token-factory";
import { ImportJsonModal } from "../../../common/import-json-modal";
import { ImportExcelModal } from "../../hosts/host/flow/points/views/import-export";

import RubixConnection = storage.RubixConnection;
import UUIDs = backend.UUIDs;

export const ConnectionsTable = ({ data, fetch, isFetching }: any) => {
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<RubixConnection[]>([]);
  const [currentConnection, setCurrentConnection] = useState({} as RubixConnection);
  const [connectionSchema, setConnectionSchema] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);

  const factory = new ConnectionFactory();
  const tokenFactory: RubixAssistTokenFactory = new RubixAssistTokenFactory();

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      title: "Actions",
      key: "actions",
      fixed: "left",
      render: (_: any, conn: RubixConnection) => (
        <Space size="middle">
          <Tooltip title="Ping">
            <a onClick={() => pingConnection(conn.uuid)}>
              <PhoneOutlined />
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
      setSelectedKeys(selectedRowKeys);
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

  const addConnection = async (connection: RubixConnection) => {
    factory.this = connection;
    try {
      const res = await factory.Add();
      if (res && res.uuid) {
        openNotificationWithIcon("success", `added ${connection.name} success`);
      } else {
        openNotificationWithIcon("error", `added ${connection.name} fail`);
      }
    } catch (err) {
      openNotificationWithIcon("error", err);
    }
  };

  const handleAddConnectionsBulk = async (data: any[]) => {
    const promises = [];
    for (let item of data) {
      promises.push(addConnection(item));
    }
    await Promise.all(promises);
  };

  const handleExport = () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    factory.ExportConnection(selectedKeys);
  };

  useEffect(() => {
    tokenFactory.connectionUUID = currentConnection.uuid;
  }, [currentConnection]);

  useEffect(() => {
    setFilteredData(data);
    if (isObjectEmpty(connectionSchema)) {
      getSchema();
    }
  }, [data]);

  return (
    <div>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as RubixConnection)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbExportButton handleExport={handleExport} />
      <ImportDropdownButton refreshList={fetch} schema={connectionSchema} handleSubmit={handleAddConnectionsBulk} />

      {data.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        dataSource={filteredData}
        rowSelection={rowSelection}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
        rowClassName={(record: RubixConnection) => (record.enable ? "" : "opacity-05")}
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

const ImportDropdownButton = (props: any) => {
  const { refreshList, schema, handleSubmit } = props;
  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

  const style: React.CSSProperties = { lineHeight: "3rem" };

  const items: MenuProps["items"] = [
    // {
    //   label: "json",
    //   key: "json",
    //   onClick: () => setIsJsonModalVisible(true),
    //   style,
    // },
    {
      label: "excel",
      key: "excel",
      onClick: () => setIsExcelModalVisible(true),
      style,
    },
  ];

  const menu = <Menu items={items} />;

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]} className="rb-btn">
        <Button className="nube-primary white--text" icon={<ImportOutlined />}>
          Import
        </Button>
      </Dropdown>

      <ImportJsonModal
        isModalVisible={isJsonModalVisible}
        onClose={() => setIsJsonModalVisible(false)}
        refreshList={refreshList}
      />

      <ImportExcelModal
        isModalVisible={isExcelModalVisible}
        onClose={() => setIsExcelModalVisible(false)}
        refreshList={refreshList}
        schema={schema}
        handleSubmit={handleSubmit}
      />
    </>
  );
};
