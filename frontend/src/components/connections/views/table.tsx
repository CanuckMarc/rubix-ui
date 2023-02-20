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
import { isObjectEmpty, openNotificationWithIcon, titleCase } from "../../../utils/utils";
import { TokenModal } from "../../../common/token/token-modal";
import { ConnectionFactory } from "../factory";
import { CreateEditModal } from "./create";
import { RubixAssistTokenFactory } from "./token-factory";
import { ImportJsonModal } from "../../../common/import-json-modal";
import { ImportExcelModal } from "../../hosts/host/flow/points/views/import-export";
import { CreateConnectionWizard } from "./connection-wizard";
import { hasError } from "../../../utils/response";
import { SELECTED_ITEMS } from "../../rubix-flow/use-nodes-spec";
import MassEdit from "../../../common/mass-edit";

import RubixConnection = storage.RubixConnection;
import UUIDs = backend.UUIDs;

export const ConnectionsTable = ({ data, fetch, isFetching }: any) => {
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<RubixConnection[]>([]);
  const [tableHeaders, setTableHeaders] = useState<any[]>([]);
  const [currentConnection, setCurrentConnection] = useState({} as RubixConnection);
  const [connectionSchema, setConnectionSchema] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWizardModalVisible, setIsWizardModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);

  const factory = new ConnectionFactory();
  const tokenFactory: RubixAssistTokenFactory = new RubixAssistTokenFactory();

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedKeys(selectedRowKeys);
      setSelectedUUIDs(selectedRows);
      localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedRows));
    },
  };

  const showTokenModal = (connection: RubixConnection, e: any) => {
    e.stopPropagation();
    setCurrentConnection(connection);
    setIsTokenModalVisible(true);
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const jsonSchema = await factory.Schema();
    setConnectionSchema(jsonSchema);
    getTableHeaders(jsonSchema.properties);
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
    const res = await factory.Add();
    if (!hasError(res)) {
      openNotificationWithIcon("success", `added ${res.data.name} success`);
    } else {
      openNotificationWithIcon("error", res.msg);
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

  const getTableHeaders = (schema: any) => {
    if (!schema) return;
    const massEditColumnKeys = ["description", "port", "https", "enable"];
    delete schema.external_token;
    let headers = Object.keys(schema).map((key) => {
      if (key === "ip") {
        schema[key].title = "address";
      } else if (key === "https") {
        schema[key].title = "https";
      }

      return {
        title: massEditColumnKeys.includes(key) ? MassEditTitle(key, schema) : titleCase(schema[key]?.title),
        dataIndex: key,
        key: key,
        sorter: (a: any, b: any) => ("" + a[key] ?? "").localeCompare("" + b[key] ?? ""),
        render: (a: any) => "" + (a ?? ""), // boolean values doesn't display on the table
      };
    });

    // styling columns
    const stylingColumns = [...CONNECTION_HEADERS];
    const stylingColumnKeys = stylingColumns.map((c: any) => c.key);
    headers = headers.map((header: any) => {
      if (stylingColumnKeys.includes(header.key)) {
        const column = stylingColumns.find((col: any) => col.key === header.key);
        return { ...header, render: column?.render };
      } else {
        return header;
      }
    });

    const headerWithActions = [
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
            <Tooltip title="Login">
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
      ...headers,
      {
        key: "uuid",
        title: "UUID",
        dataIndex: "uuid",
      },
    ];

    setTableHeaders(headerWithActions);
  };

  const MassEditTitle = (key: string, schema: any) => {
    return (
      <MassEdit fullSchema={schema} title={titleCase(schema[key]?.title)} keyName={key} handleOk={handleMassEdit} />
    );
  };

  const handleMassEdit = async (updateData: any) => {
    const selectedItems = JSON.parse("" + localStorage.getItem(SELECTED_ITEMS)) || [];
    const promises = [];
    for (let item of selectedItems) {
      item = { ...item, ...updateData };
      promises.push(editConnection(item));
    }
    await Promise.all(promises);
    fetch();
  };

  const editConnection = async (connection: RubixConnection) => {
    factory.uuid = connection.uuid;
    factory.this = connection;
    return await factory.Update();
  };

  useEffect(() => {
    localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedUUIDs));
    return () => {
      localStorage.removeItem(SELECTED_ITEMS);
    };
  }, []);

  useEffect(() => {
    tokenFactory.connectionUUID = currentConnection.uuid;
  }, [currentConnection]);

  useEffect(() => {
    if (isObjectEmpty(connectionSchema)) {
      getSchema();
    }
  }, [data]);

  return (
    <div>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => setIsWizardModalVisible(true)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbExportButton handleExport={handleExport} />
      <ImportDropdownButton refreshList={fetch} schema={connectionSchema} handleSubmit={handleAddConnectionsBulk} />

      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        dataSource={data?.length > 0 ? filteredData : []}
        rowSelection={rowSelection}
        columns={tableHeaders}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateConnectionWizard
        currentConnection={currentConnection}
        connectionSchema={connectionSchema}
        isLoadingForm={isLoadingForm}
        refreshList={fetch}
        tokenFactory={tokenFactory}
        isWizardModalVisible={isWizardModalVisible}
        setIsWizardModalVisible={setIsWizardModalVisible}
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
