import { Button, Menu, Dropdown, Space, Spin, Tag, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { FormOutlined, GoldOutlined, ImportOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backend, model } from "../../../../../../../wailsjs/go/models";
import RbTable from "../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbExportButton,
  RbRestartButton,
} from "../../../../../../common/rb-table-actions";
import RbTableFilterNameInput from "../../../../../../common/rb-table-filter-name-input";
import MassEdit from "../../../../../../common/mass-edit";
import { FLOW_POINT_HEADERS, FLOW_POINT_HEADERS_TABLE } from "../../../../../../constants/headers";
import { openNotificationWithIcon } from "../../../../../../utils/utils";
import { FlowNetworkFactory } from "../../networks/factory";
import { FlowPluginFactory } from "../../plugins/factory";
import { FlowPointFactory } from "../factory";
import { CreateBulkModal, CreateModal } from "./create";
import { EditModal } from "./edit";
import { ExportModal, ImportExcelModal, ImportJsonModal } from "./import-export";
import { WritePointValueModal } from "./write-point-value";
import { SELECTED_ITEMS } from "../../../../../rubix-flow/use-nodes-spec";

import Point = model.Point;
import UUIDs = backend.UUIDs;

export const FlowPointsTable = (props: any) => {
  const { connUUID = "", hostUUID = "", deviceUUID = "", pluginName = "" } = useParams();
  const { data, isFetching, refreshList, dataSource, setDataSource } = props;
  const [schema, setSchema] = useState({} as any);
  const [currentItem, setCurrentItem] = useState({} as Point);
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [tableHeaders, setTableHeaders] = useState<any[]>([]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreateBulkModalVisible, setIsCreateBulkModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isWritePointModalVisible, setIsWritePointModalVisible] = useState(false);

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

    const columns = [
      {
        title: "name",
        dataIndex: "name",
        key: "name",
        render(name: string) {
          if (name != undefined) {
            let colour = "#4d4dff";
            return <Tag color={colour}>{name}</Tag>;
          }
        },
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        filterDropdown: () => <RbTableFilterNameInput defaultData={data} setFilteredData={setDataSource} />,
      },
      ...FLOW_POINT_HEADERS,
    ] as any;

    delete schema.plugin_name; //prevent mass edit on plugin_name
    const columnKeys = columns.map((c: any) => c.key);
    let headers = Object.keys(schema).map((key) => {
      return {
        title: key === "name" || key === "uuid" ? key.replaceAll("_", " ") : MassEditTitle(key, schema),
        dataIndex: key,
        key: key,
        sorter: (a: any, b: any) => {
          if (schema[key].type === "string") {
            a[key] = a[key] ?? ""; //case item not have a[key] property
            b[key] = b[key] ?? "";
            return a[key].localeCompare(a[key]);
          } else {
            return a[key] - b[key];
          }
        },
      };
    });

    //styling columns
    headers = headers.map((header: any) => {
      if (columnKeys.includes(header.key)) {
        const headerFromColumns = columns.find((col: any) => col.key === header.key);
        headerFromColumns.title = header.title;
        return headerFromColumns;
      } else {
        return header;
      }
    });

    const headerWithActions = [
      {
        title: "actions",
        key: "actions",
        fixed: "left",
        render: (_: any, point: Point) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <a onClick={() => showEditModal(point)}>
                <FormOutlined />
              </a>
            </Tooltip>
            <Tooltip title="Write Point">
              <a onClick={() => showWritePointModal(point)}>
                <GoldOutlined style={{ color: "#fa8c16" }} />
              </a>
            </Tooltip>
          </Space>
        ),
      },
      ...headers,
      ...FLOW_POINT_HEADERS_TABLE,
      {
        title: "plugin name",
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
    return <MassEdit fullSchema={schema} keyName={key} handleOk={handleMassEdit} />;
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

  const showEditModal = (item: Point) => {
    setCurrentItem(item);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const showCreateBulkModal = () => {
    setIsCreateBulkModalVisible(true);
  };

  const closeCreateBulkModal = () => {
    setIsCreateBulkModalVisible(false);
  };

  const showWritePointModal = (item: Point) => {
    setIsWritePointModalVisible(true);
    setCurrentItem(item);
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
      <RbRestartButton handleClick={handleRestart} loading={isRestarting} />
      <RbAddButton handleClick={showCreateModal} />
      <RbAddButton handleClick={showCreateBulkModal} text="Create bulk" />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <ImportDropdownButton refreshList={refreshList} schema={schema} />
      <RbExportButton handleExport={handleExport} />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={dataSource}
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
        onCloseModal={closeEditModal}
        refreshList={refreshList}
      />
      <CreateModal
        isModalVisible={isCreateModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        deviceUUID={deviceUUID}
        schema={schema}
        onCloseModal={closeCreateModal}
        refreshList={refreshList}
      />
      <CreateBulkModal
        isModalVisible={isCreateBulkModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        hostUUID={hostUUID}
        deviceUUID={deviceUUID}
        schema={schema}
        onCloseModal={closeCreateBulkModal}
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
