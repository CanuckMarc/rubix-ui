import { Space, Spin, Tag, Tooltip } from "antd";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backend, model } from "../../../../../../../wailsjs/go/models";
import RbTable from "../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbExportButton,
  RbImportButton,
  RbRestartButton,
} from "../../../../../../common/rb-table-actions";
import { FLOW_DEVICE_HEADERS } from "../../../../../../constants/headers";
import { ROUTES } from "../../../../../../constants/routes";
import { openNotificationWithIcon, titleCase } from "../../../../../../utils/utils";
import { FlowPluginFactory } from "../../plugins/factory";
import { FlowDeviceFactory } from "../factory";
import { CreateModal } from "./create";
import { EditModal } from "./edit";
import { ExportModal, ImportModal } from "./import-export";
import MassEdit from "../../../../../../common/mass-edit";
import { SELECTED_ITEMS } from "../../../../../rubix-flow/use-nodes-spec";
import { RbSearchInput } from "../../../../../../common/rb-search-input";
import Device = model.Device;
import UUIDs = backend.UUIDs;

export const FlowDeviceTable = (props: any) => {
  const { connUUID = "", locUUID = "", netUUID = "", hostUUID = "", networkUUID = "", pluginName = "" } = useParams();
  const { data, isFetching, refreshList } = props;
  const [schema, setSchema] = useState({});
  const [currentItem, setCurrentItem] = useState({});
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [tableHeaders, setTableHeaders] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<Device[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  const flowDeviceFactory = new FlowDeviceFactory();
  const flowPluginFactory = new FlowPluginFactory();
  flowDeviceFactory.connectionUUID = flowPluginFactory.connectionUUID = connUUID;
  flowDeviceFactory.hostUUID = flowPluginFactory.hostUUID = hostUUID;

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
      localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedRows));
    },
  };

  const bulkDelete = async () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    await flowDeviceFactory.BulkDelete(selectedUUIDs);
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

  const getNavigationLink = (deviceUUID: string): string => {
    return ROUTES.POINTS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":networkUUID", networkUUID)
      .replace(":deviceUUID", deviceUUID)
      .replace(":pluginName", pluginName);
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await flowDeviceFactory.Schema(connUUID, hostUUID, pluginName as unknown as string);
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    getTableHeaders(jsonSchema.properties);
    setIsLoadingForm(false);
  };

  const getTableHeaders = (schema: any) => {
    if (!schema) return;

    const stylingColumns = [...FLOW_DEVICE_HEADERS];

    delete schema.plugin_name; // prevent mass edit on plugin_name
    const stylingColumnKeys = stylingColumns.map((c: any) => c.key);
    let headers = Object.keys(schema).map((key) => {
      return {
        title: ["name", "uuid", "description"].includes(key)
          ? titleCase(schema[key]?.title)
          : MassEditTitle(key, schema),
        dataIndex: key,
        key: key,
        sorter: (a: any, b: any) => ("" + a[key] ?? "").localeCompare("" + b[key] ?? ""),
        render: (a: any) => "" + (a ?? ""), // boolean values doesn't display on the table
      };
    });

    // styling columns
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
        render: (_: any, device: Device) => (
          <Space size="middle">
            <Tooltip title="Edit">
              <a onClick={() => showEditModal(device)}>
                <FormOutlined />
              </a>
            </Tooltip>
            <Link to={getNavigationLink(device.uuid)}>
              <Tooltip title="View Points">
                <ArrowRightOutlined />
              </Tooltip>
            </Link>
          </Space>
        ),
      },
      ...headers,
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
    await flowDeviceFactory.Update(item.uuid, item);
  };

  const showEditModal = (item: any) => {
    setCurrentItem(item);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setCurrentItem({});
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  useEffect(() => {
    localStorage.setItem(SELECTED_ITEMS, JSON.stringify(selectedUUIDs)); //run when init component
    return () => {
      localStorage.removeItem(SELECTED_ITEMS); //run when destroy component
    };
  }, []);

  useEffect(() => {
    getSchema();
  }, [pluginName]);

  return (
    <>
      <RbAddButton handleClick={() => showCreateModal()} />
      <RbRestartButton handleClick={handleRestart} loading={isRestarting} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbImportButton showModal={() => setIsImportModalVisible(true)} />
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
        schema={schema}
        onCloseModal={closeEditModal}
        refreshList={refreshList}
      />
      <CreateModal
        isModalVisible={isCreateModalVisible}
        isLoadingForm={isLoadingForm}
        schema={schema}
        onCloseModal={closeCreateModal}
        refreshList={refreshList}
      />
      <ExportModal
        isModalVisible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        selectedItems={selectedUUIDs}
      />
      <ImportModal
        isModalVisible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        refreshList={refreshList}
      />
    </>
  );
};
