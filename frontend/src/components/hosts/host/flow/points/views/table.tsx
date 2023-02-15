import { FormOutlined, GoldOutlined, ImportOutlined, HistoryOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, MenuProps, Space, Spin, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backend, model } from "../../../../../../../wailsjs/go/models";
import MassEdit from "../../../../../../common/mass-edit";
import { RbSearchInput } from "../../../../../../common/rb-search-input";
import RbTable from "../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbExportButton,
  RbRestartButton,
} from "../../../../../../common/rb-table-actions";
import { FLOW_POINT_HEADERS, FLOW_POINT_HEADERS_TABLE } from "../../../../../../constants/headers";
import { openNotificationWithIcon, titleCase } from "../../../../../../utils/utils";
import { SELECTED_ITEMS } from "../../../../../rubix-flow/use-nodes-spec";
import { FlowNetworkFactory } from "../../networks/factory";
import { FlowPluginFactory } from "../../plugins/factory";
import { FlowPointFactory } from "../factory";
import { CreateBulkModal, CreateModal } from "./create";
import { EditModal } from "./edit";
import { EditHistoryModal } from "./edit-history";
import { ExportModal, ImportExcelModal, ImportJsonModal } from "./import-export";
import { WritePointValueModal } from "./write-point-value";
import Point = model.Point;
import UUIDs = backend.UUIDs;

export const FlowPointsTable = (props: any) => {
  const { connUUID = "", hostUUID = "", deviceUUID = "", pluginName = "" } = useParams();
  const { data, isFetching, refreshList } = props;
  const [schema, setSchema] = useState({} as any);
  const [currentItem, setCurrentItem] = useState({} as Point);
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [tableHeaders, setTableHeaders] = useState<any[]>([]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreateBulkModalVisible, setIsCreateBulkModalVisible] = useState(false);
  const [isUpdateHistoryModalVisible, setIsUpdateHistoryModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isWritePointModalVisible, setIsWritePointModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState<Point[]>([]);

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };
  const flowPointFactory = new FlowPointFactory();
  const flowNetworkFactory = new FlowNetworkFactory();
  const flowPluginFactory = new FlowPluginFactory();
  flowPointFactory.connectionUUID = flowNetworkFactory.connectionUUID = flowPluginFactory.connectionUUID = connUUID;
  flowPointFactory.hostUUID = flowNetworkFactory.hostUUID = flowPluginFactory.hostUUID = hostUUID;

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
      localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedRows));
    },
  };

  const bulkDelete = async () => {
    await flowPointFactory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    await flowPluginFactory.RestartBulk([pluginName]);
    setIsRestarting(false);
  };

  const handleExport = () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    setIsExportModalVisible(true);
  };

  const getSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await flowPointFactory.Schema(connUUID, hostUUID, pluginName);
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    setIsLoadingForm(false);
    getTableHeaders(jsonSchema.properties);
  };

  const getTableHeaders = (schema: any) => {
    if (!schema) return;

    const stylingColumns = [...FLOW_POINT_HEADERS];

    delete schema.plugin_name; // prevent mass edit on plugin_name
    const stylingColumnKeys = stylingColumns.map((c: any) => c.key);
    let headers = Object.keys(schema).map((key) => {
      return {
        title: ["name", "uuid"].includes(key) ? titleCase(schema[key]?.title) : MassEditTitle(key, schema),
        dataIndex: key,
        key: key,
        sorter: (a: any, b: any) => ("" + a[key] ?? "").localeCompare("" + b[key] ?? ""),
        render: (a: any) => "" + (a ?? ""), // boolean values doesn't display on the table
      };
    });

    //styling columns
    headers = headers.map((header: any) => {
      if (stylingColumnKeys.includes(header.key)) {
        return stylingColumns.find((col: any) => col.key === header.key);
      } else {
        return header;
      }
    });

    const headerWithActions = [
      {
        title: "Actions",
        key: "actions",
        fixed: "left",
        render: (_: any, point: Point) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <a onClick={() => showEditModal(point)}>
                <FormOutlined />
              </a>
            </Tooltip>
            <Tooltip title="Write point">
              <a onClick={() => showWritePointModal(point)}>
                <GoldOutlined style={{ color: "#fa8c16" }} />
              </a>
            </Tooltip>
            <Tooltip title="Update history">
              <a onClick={() => showUpdateHistoryModal(point)}>
                <HistoryOutlined />
              </a>
            </Tooltip>
          </Space>
        ),
      },
      ...headers,
      ...FLOW_POINT_HEADERS_TABLE,
      {
        title: "Plugin Name",
        key: "plugin_name",
        dataIndex: "plugin_name",
        render() {
          let colour = "#4d4dff";
          let text = pluginName.toUpperCase();
          return <Tag color={colour}>{text}</Tag>;
        },
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
      promises.push(edit(item));
    }
    await Promise.all(promises);
    refreshList();
  };

  const edit = async (item: any) => {
    await flowPointFactory.Update(item.uuid, item);
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const showCreateBulkModal = () => {
    setIsCreateBulkModalVisible(true);
  };

  const showEditModal = (item: Point) => {
    setCurrentItem(item);
    setIsEditModalVisible(true);
  };

  const showWritePointModal = (item: Point) => {
    setCurrentItem(item);
    setIsWritePointModalVisible(true);
  };

  const showUpdateHistoryModal = (item: Point) => {
    setCurrentItem(item);
    setIsUpdateHistoryModalVisible(true);
  };

  const closeModal = () => {
    setIsCreateBulkModalVisible(false);
    setIsCreateModalVisible(false);
    setIsEditModalVisible(false);
    setIsUpdateHistoryModalVisible(false);
  };

  useEffect(() => {
    localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedUUIDs));
    return () => {
      localStorage.removeItem(SELECTED_ITEMS);
    };
  }, []);

  useEffect(() => {
    getSchema(pluginName);
  }, [pluginName]);

  return (
    <>
      <RbAddButton handleClick={showCreateModal} />
      <RbRestartButton handleClick={handleRestart} loading={isRestarting} />
      <RbAddButton handleClick={showCreateBulkModal} text="Create bulk" />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <ImportDropdownButton refreshList={refreshList} schema={schema} />
      <RbExportButton handleExport={handleExport} />
      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data?.length > 0 ? filteredData : []}
        columns={tableHeaders}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <EditModal
        currentItem={currentItem}
        isModalVisible={isEditModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        schema={schema}
        onCloseModal={closeModal}
        refreshList={refreshList}
      />
      <CreateModal
        isModalVisible={isCreateModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        deviceUUID={deviceUUID}
        schema={schema}
        onCloseModal={closeModal}
        refreshList={refreshList}
      />
      <CreateBulkModal
        isModalVisible={isCreateBulkModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        deviceUUID={deviceUUID}
        schema={schema}
        onCloseModal={closeModal}
        refreshList={refreshList}
      />
      <ExportModal
        isModalVisible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        selectedItems={selectedUUIDs}
      />
      <WritePointValueModal
        isModalVisible={isWritePointModalVisible}
        onCloseModal={() => setIsWritePointModalVisible(false)}
        point={currentItem}
        refreshList={refreshList}
      />
      <EditHistoryModal
        isModalVisible={isUpdateHistoryModalVisible}
        currentItem={currentItem}
        refreshList={refreshList}
        onCloseModal={closeModal}
      />
    </>
  );
};

const ImportDropdownButton = (props: any) => {
  const { refreshList, schema } = props;
  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

  const style: React.CSSProperties = { lineHeight: "3rem" };

  const items: MenuProps["items"] = [
    {
      label: "json",
      key: "json",
      onClick: () => setIsJsonModalVisible(true),
      style,
    },
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
      />
    </>
  );
};
