import { Modal, Space, Spin, Tooltip } from "antd";
import { ArrowRightOutlined, BookOutlined, FormOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backend, model } from "../../../../../../../wailsjs/go/models";
import RbTable from "../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbExportButton,
  RbImportButton,
  RbRefreshButton,
  RbRestartButton,
  RbSyncButton,
} from "../../../../../../common/rb-table-actions";
import { openNotificationWithIcon } from "../../../../../../utils/utils";
import { NETWORK_HEADERS } from "../../../../../../constants/headers";
import { ROUTES } from "../../../../../../constants/routes";
import { FlowPluginFactory } from "../../plugins/factory";
import { FlowNetworkFactory } from "../factory";
import { CreateModal, EditModal } from "./create";
import { ExportModal, ImportModal } from "./import-export";
import "./style.css";
import { RbSearchInput } from "../../../../../../common/rb-search-input";
import { LogTable } from "./logTable";
import { hasError } from "../../../../../../utils/response";
import { NetworkWizard } from "./network-wizard";
import UUIDs = backend.UUIDs;
import Network = model.Network;

export interface LogTablePropType {
  pluginName: string | undefined;
  connUUID: string;
  hostUUID: string;
  resetLogTableData: boolean;
  setResetLogTableData: Function;
}

export interface ExternalWindowParamType {
  connUUID: string;
  hostUUID: string;
  logNetwork: string | undefined;
}

export const FlowNetworkTable = () => {
  let { connUUID = "", hostUUID = "", netUUID = "", locUUID = "" } = useParams();
  const [currentItem, setCurrentItem] = useState({});
  const [networkSchema, setNetworkSchema] = useState({});
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [networks, setNetworks] = useState([] as Network[]);
  const [filteredData, setFilteredData] = useState<Network[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [logNetwork, setLogNetwork] = useState<model.Network>();
  const [isLogTableOpen, setIsLogTableOpen] = useState(false);
  const [resetLogTableData, setResetLogTableData] = useState(false);
  const [isWizardModalVisible, setIsWizardModalVisible] = useState(false);

  const config = {
    originData: networks,
    setFilteredData: setFilteredData,
  };

  const networkFactory = new FlowNetworkFactory();
  const flowPluginFactory = new FlowPluginFactory();
  networkFactory.connectionUUID = flowPluginFactory.connectionUUID = connUUID;
  networkFactory.hostUUID = flowPluginFactory.hostUUID = hostUUID;

  const columns = [
    {
      key: "actions",
      title: "Actions",
      fixed: "left",
      render: (_: any, network: model.Network) => (
        <Space size="middle">
          <Tooltip placement="right" title="Edit">
            <a onClick={() => showModal(network)}>
              <FormOutlined />
            </a>
          </Tooltip>
          <Tooltip placement="right" title="Log">
            <a onClick={() => onOpenLog(network)}>
              <BookOutlined />
            </a>
          </Tooltip>
          <Link to={getNavigationLink(network.uuid, network.plugin_name || "")}>
            <Tooltip placement="right" title="View Devices">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    ...NETWORK_HEADERS,
  ];

  const onOpenLog = (network: model.Network) => {
    setLogNetwork(network);
    setIsLogTableOpen(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const fetchNetworks = async () => {
    try {
      setIsFetching(true);
      const res = (await networkFactory.GetAll(false)) || [];
      setNetworks(res);
      setFilteredData(res);
    } finally {
      setIsFetching(false);
    }
  };

  const syncNetworks = async () => {
    try {
      setIsFetching(true);
      const res = await networkFactory.Sync();
      if (hasError(res)) {
        openNotificationWithIcon("error", res.msg);
      } else {
        openNotificationWithIcon("success", res.data);
      }
      await fetchNetworks();
    } finally {
      setIsFetching(false);
    }
  };

  const getSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await networkFactory.Schema(connUUID, hostUUID, pluginName);
    const jsonSchema = {
      properties: res,
    };
    setNetworkSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const showModal = (item: any) => {
    setCurrentItem(item);
    setIsModalVisible(true);
    getSchema(item.plugin_name);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentItem({});
  };

  const bulkDelete = async () => {
    await networkFactory.BulkDelete(selectedUUIDs);
    fetchNetworks();
    setSelectedUUIDs([]);
  };

  const handleRestart = async () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    setIsRestarting(true);
    const selectedNetworks = selectedUUIDs as Network[];
    const pluginNames = selectedNetworks.map((net) => {
      return net.plugin_name;
    }) as string[];
    await flowPluginFactory.RestartBulk(pluginNames);
    setIsRestarting(false);
  };

  const handleExport = () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", `please select at least one`);
    }
    setIsExportModalVisible(true);
  };

  const getNavigationLink = (networkUUID: string, pluginName: string): string => {
    return ROUTES.DEVICES.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":networkUUID", networkUUID)
      .replace(":pluginName", pluginName);
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleOk = () => {
    setIsLogTableOpen(false);
    setResetLogTableData(true);
  };

  const handleCancel = () => {
    setIsLogTableOpen(false);
    setResetLogTableData(true);
  };

  return (
    <>
      <RbRefreshButton refreshList={fetchNetworks} />
      <RbSyncButton onClick={syncNetworks} />
      <RbAddButton handleClick={() => setIsCreateModalVisible(true)} />
      <RbAddButton handleClick={() => setIsWizardModalVisible(true)} />
      <RbRestartButton handleClick={handleRestart} loading={isRestarting} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbImportButton showModal={() => setIsImportModalVisible(true)} />
      <RbExportButton handleExport={handleExport} />
      {networks?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={networks?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <EditModal
        currentItem={currentItem}
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        networkSchema={networkSchema}
        refreshList={fetchNetworks}
        onCloseModal={closeModal}
      />
      <CreateModal
        isModalVisible={isCreateModalVisible}
        onCloseModal={() => setIsCreateModalVisible(false)}
        refreshList={fetchNetworks}
      />
      <ExportModal
        isModalVisible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        selectedItems={selectedUUIDs}
      />
      <ImportModal
        isModalVisible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        refreshList={fetchNetworks}
      />
      <NetworkWizard
        refreshList={fetchNetworks}
        isWizardModalVisible={isWizardModalVisible}
        setIsWizardModalVisible={setIsWizardModalVisible}
      />
      <Modal title="Log table" visible={isLogTableOpen} onOk={handleOk} onCancel={handleCancel} width={"70vw"}>
        <LogTable
          connUUID={connUUID}
          hostUUID={hostUUID}
          pluginName={logNetwork?.plugin_name}
          resetLogTableData={resetLogTableData}
          setResetLogTableData={setResetLogTableData}
        />
      </Modal>
    </>
  );
};
