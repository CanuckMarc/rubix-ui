import { Space, Spin, Tooltip } from "antd";
import { ArrowRightOutlined, DownloadOutlined, FormOutlined, PhoneOutlined, ScanOutlined, SubnodeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { amodel, backend } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbMonitorButton,
  RbRefreshButton,
  RbSyncButton
} from "../../../common/rb-table-actions";
import { HOST_HEADERS } from "../../../constants/headers";
import { ROUTES } from "../../../constants/routes";
import { isObjectEmpty, openNotificationWithIcon } from "../../../utils/utils";
import { HostsFactory } from "../factory";
import { CreateEditModal } from "./modals";
import "./style.css";
import { TokenModal } from "../../../common/token/token-modal";
import { EdgeBiosTokenFactory } from "../../edgebios/token-factory";
import { InstallRubixEdgeModal } from "./install-rubix-edge/install-rubix-edge-modal";
import { InstallFactory } from "./install-rubix-edge/factory";
import { EdgeAppInfo } from "./install-app-info";
import {GitDownloadReleases, UpdateStatus} from "../../../../wailsjs/go/backend/App";
import Host = amodel.Host;
import Location = amodel.Location;
import UUIDs = backend.UUIDs;
import { RbSearchInput } from "../../../common/rb-search-input";

const ExpandedRow = (props: any) => {
  return (
    <div>
      <EdgeAppInfo {...props} />
    </div>
  );
};

export const HostsTable = (props: any) => {
  const { connUUID = "", netUUID = "", locUUID = "" } = useParams();
  const { hosts, isFetching, refreshList } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [currentHost, setCurrentHost] = useState({} as Host);
  const [hostSchema, setHostSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isInstallRubixEdgeModalVisible, setIsInstallRubixEdgeModalVisible] = useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [loadingSyncReleases, setLoadingSyncReleases] = useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);
  const [tokenFactory, setTokenFactory] = useState(new EdgeBiosTokenFactory(connUUID));
  const [filteredData, setFilteredData] = useState(hosts);

  const config = {
    originData: hosts,
    setFilteredData: setFilteredData,
  };

  const factory = new HostsFactory();
  const installFactory = new InstallFactory();
  factory.connectionUUID = connUUID;
  installFactory.connectionUUID = connUUID;

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, host: Host) => (
        <Space size="middle">
          <Tooltip title="Ping">
            <a onClick={(e) => handlePing(host.uuid, e)}>
              <PhoneOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Edit">
            <a onClick={(e) => showModal(host, e)}>
              <FormOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Install Rubix Edge">
            <a onClick={(e) => showRubixEdgeInstallModal(host, e)}>
              <DownloadOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Tokens">
            <a onClick={(e) => showTokenModal(host, e)}>
              <ScanOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Configure OpenVPN">
            <a onClick={(e) => configureOpenVPN(host, e)}>
              <SubnodeOutlined />
            </a>
          </Tooltip>
          <Link
            to={ROUTES.HOST.replace(":connUUID", connUUID)
              .replace(":locUUID", locUUID)
              .replace(":netUUID", netUUID)
              .replace(":hostUUID", host.uuid)}
          >
            <Tooltip title="View Networks">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    ...HOST_HEADERS
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    try {
      const res = await factory.Schema();
      const jsonSchema = {
        properties: res,
      };
      setHostSchema(jsonSchema);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const handlePing = (uuid: string, e: any) => {
    e.stopPropagation();
    factory.uuid = uuid;
    factory.PingHost().catch(console.error);
  };

  const showModal = (host: Host, e: any) => {
    e.stopPropagation();
    setCurrentHost(host);
    setIsModalVisible(true);
    if (isObjectEmpty(hostSchema)) {
      getSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentHost({} as Host);
  };

  const showRubixEdgeInstallModal = (host: Host, e: any) => {
    e.stopPropagation();
    setCurrentHost(host);
    setIsInstallRubixEdgeModalVisible(true);
  };

  const onCloseRubixEdgeInstallModal = () => {
    setIsInstallRubixEdgeModalVisible(false);
  };

  const showTokenModal = (host: Host, e: any) => {
    e.stopPropagation();
    setCurrentHost(host);
    setIsTokenModalVisible(true);
  };

  const onCloseTokenModal = () => {
    setIsTokenModalVisible(false);
    setCurrentHost({} as Host);
  };

  const configureOpenVPN = (host: Host, e: any) => {
    e.stopPropagation();
    factory.uuid = host.uuid;
    factory.ConfigureOpenVPN().catch(console.error);
  };

  useEffect(() => {
    const _tokenFactory: EdgeBiosTokenFactory = new EdgeBiosTokenFactory(connUUID);
    _tokenFactory.hostUUID = currentHost.uuid;
    setTokenFactory(_tokenFactory);
  }, [currentHost]);

  const onSyncReleases = async () => {
    setLoadingSyncReleases(true);
    try {
      await GitDownloadReleases();
    } catch (error) {
      openNotificationWithIcon("error", error);
    } finally {
      setLoadingSyncReleases(false);
    }
  };

  const onUpdateStatus = async () => {
    setLoadingUpdateStatus(true);
    try {
      await factory.UpdateStatus();
      await refreshList()
    } catch (error) {
      openNotificationWithIcon("error", error);
    } finally {
      setLoadingUpdateStatus(false);
    }
  };

  return (
    <div>
      <RbRefreshButton refreshList={refreshList} />
      <RbMonitorButton onClick={onUpdateStatus} loading={loadingUpdateStatus} text="Update Status" />
      <RbAddButton handleClick={(e: any) => showModal({} as Host, e)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbSyncButton onClick={onSyncReleases} loading={loadingSyncReleases} text="Sync Releases" />
      {hosts.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
        expandable={{
          expandedRowRender: (host: any) => <ExpandedRow host={host} />,
          rowExpandable: (record: any) => record.name !== "Not Expandable",
        }}
        expandRowByClick
      />

      <CreateEditModal
        hosts={hosts}
        currentHost={currentHost}
        hostSchema={hostSchema}
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        connUUID={connUUID}
        refreshList={refreshList}
        onCloseModal={onCloseModal}
      />
      <InstallRubixEdgeModal
        isModalVisible={isInstallRubixEdgeModalVisible}
        onCloseModal={onCloseRubixEdgeInstallModal}
        installFactory={installFactory}
        host={currentHost}
      />
      <TokenModal
        isModalVisible={isTokenModalVisible}
        displayName={currentHost.name}
        onCloseModal={onCloseTokenModal}
        factory={tokenFactory}
        selectedItem={currentHost}
      />
    </div>
  );
};
