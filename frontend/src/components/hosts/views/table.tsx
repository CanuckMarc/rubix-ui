import { Space, Spin, Tooltip } from "antd";
import { ArrowRightOutlined, DownloadOutlined, FormOutlined, LinkOutlined, ScanOutlined, } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { amodel, backend } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton, RbSyncButton, } from "../../../common/rb-table-actions";
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
import { GitDownloadReleases } from "../../../../wailsjs/go/backend/App";
import Host = amodel.Host;
import Location = amodel.Location;
import UUIDs = backend.UUIDs;

const ExpandedRow = (props: any) => {
  return (
    <div>
      <EdgeAppInfo {...props} />
    </div>
  );
};

export const HostsTable = (props: any) => {
  const { connUUID = "", netUUID = "", locUUID = "" } = useParams();
  const { hosts, networks, isFetching, refreshList } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [currentHost, setCurrentHost] = useState({} as Host);
  const [hostSchema, setHostSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isInstallRubixEdgeModalVisible, setIsInstallRubixEdgeModalVisible] =
    useState(false);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [loadingSyncReleases, setLoadingSyncReleases] = useState(false);
  const [tokenFactory, setTokenFactory] = useState(
    new EdgeBiosTokenFactory(connUUID)
  );

  const factory = new HostsFactory();
  const installFactory = new InstallFactory();
  factory.connectionUUID = connUUID;
  installFactory.connectionUUID = connUUID;

  const columns = [
    ...HOST_HEADERS,
    {
      title: "network",
      dataIndex: "network_uuid",
      key: "network_uuid",
      render: (network_uuid: string) => (
        <span>{getNetworkNameByUUID(network_uuid)}</span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, host: Host) => (
        <Space size="middle">
          <Tooltip title="Ping">
            <a
              onClick={(e) => {
                handlePing(host.uuid, e);
              }}
            >
              <LinkOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Edit">
            <a
              onClick={(e) => {
                showModal(host, e);
              }}
            >
              <FormOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Install Rubix Edge">
            <a
              onClick={(e) => {
                showRubixEdgeInstallModal(host, e);
              }}
            >
              <DownloadOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Tokens">
            <a
              onClick={(e) => {
                showTokenModal(host, e);
              }}
            >
              <ScanOutlined />
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

  const getNetworkNameByUUID = (uuid: string) => {
    const network = networks.find((l: Location) => l.uuid === uuid);
    return network ? network.name : "";
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

  useEffect(() => {
    const _tokenFactory: EdgeBiosTokenFactory = new EdgeBiosTokenFactory(
      connUUID
    );
    _tokenFactory.hostUUID = currentHost.uuid;
    setTokenFactory(_tokenFactory);
  }, [currentHost]);

  const onSyncReleases = async () => {
    setLoadingSyncReleases(true);
    try {
      const res = await GitDownloadReleases();
      if (res.code === 0) {
        openNotificationWithIcon("success", "synced releases successfully");
      } else {
        openNotificationWithIcon("error", res.msg);
      }
    } catch (error) {
      openNotificationWithIcon("error", error);
    } finally {
      setLoadingSyncReleases(false);
    }
  };

  return (
    <div>
      <RbRefreshButton refreshList={refreshList} />
      <RbAddButton handleClick={(e: any) => showModal({} as Host, e)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbSyncButton onClick={onSyncReleases} loading={loadingSyncReleases} text="Sync Releases" />

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={hosts}
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
      />
    </div>
  );
};
