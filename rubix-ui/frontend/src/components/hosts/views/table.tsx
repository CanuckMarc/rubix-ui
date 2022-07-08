import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Menu,
  MenuProps,
  Space,
  Spin,
  Image,
  PaginationProps,
} from "antd";
import {
  MenuFoldOutlined,
  PlayCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { DeleteHost, OpenURL } from "../../../../wailsjs/go/main/App";
import { assistmodel } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { BackupFactory } from "../../backups/factory";
import RbTable from "../../../common/rb-table";
import imageRC5 from "../../../assets/images/RC5.png";
import imageRCIO from "../../../assets/images/RC-IO.png";
import "./style.css";

import Host = assistmodel.Host;
import Location = assistmodel.Location;

type MenuItem = Required<MenuProps>["items"][number];

export const SidePanel = (props: any) => {
  const { collapsed, selectedHost, connUUID, sidePanelHeight } = props;
  const [isSaveBackup, setIsSaveBackup] = useState(false);
  const [isRestorebackup, setIsRestorebackup] = useState(false);

  let backupFactory = new BackupFactory();

  const getItem = (label: React.ReactNode, key: React.Key): MenuItem => {
    return {
      key,
      label,
    } as MenuItem;
  };

  const navigateToNewTab = (host: Host) => {
    try {
      const { ip } = host;
      const source = `http://${ip}:1313/`;
      OpenURL(source);
    } catch (err: any) {
      openNotificationWithIcon("error", err.message);
    }
  };

  const saveBackupHanlde = async (host: Host) => {
    setIsSaveBackup(true);
    try {
      backupFactory.connectionUUID = connUUID;
      backupFactory.hostUUID = host.uuid;
      backupFactory.uuid = host.uuid;
      const res = await backupFactory.WiresBackup();
      console.log("saveBackupHanlde", res);
    } catch (err: any) {
      openNotificationWithIcon("error", err.message);
    } finally {
      setIsSaveBackup(false);
    }
  };

  const restoreBackupHanlde = async (host: Host) => {
    setIsRestorebackup(true);

    try {
      backupFactory.connectionUUID = connUUID;
      backupFactory.hostUUID = host.uuid;
      backupFactory.uuid = host.uuid;
      const res = await backupFactory.WiresRestore();
      console.log("restoreBackupHanlde", res);
    } catch (err: any) {
      openNotificationWithIcon("error", err.message);
    } finally {
      setIsRestorebackup(false);
    }
  };

  const items: MenuItem[] = [
    getItem(
      <Button type="text" onClick={() => navigateToNewTab(selectedHost)}>
        open Rubix-Wires
      </Button>,
      "1"
    ),
    getItem(
      <Button
        type="text"
        onClick={() => saveBackupHanlde(selectedHost)}
        loading={isSaveBackup}
      >
        save backup
      </Button>,
      "2"
    ),
    getItem(
      <Button
        type="text"
        onClick={() => restoreBackupHanlde(selectedHost)}
        loading={isRestorebackup}
      >
        restore backup
      </Button>,
      "3"
    ),
  ];

  return (
    <Menu
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      mode="inline"
      inlineCollapsed={collapsed}
      items={items}
      style={{ height: sidePanelHeight + "px" }}
    />
  );
};

export const HostsTable = (props: any) => {
  const { hosts, networks, showModal, isFetching, connUUID, refreshList } =
    props;
  const [collapsed, setCollapsed] = useState(true);
  const [selectedHost, setSelectedHost] = useState({} as Host);
  const [sidePanelHeight, setSidePanelHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  const navigate = useNavigate();

  const columns = [
    {
      title: "product",
      key: "product_type",
      dataIndex: "product_type",
      render(product: string) {
        let image = imageRC5;
        if (product == "RubixCompute") {
          image = imageRC5;
        }
        if (product == "RubixComputeIO") {
          image = imageRCIO;
        }
        return <Image width={70} src={image} />;
      },
    },
    {
      title: "name",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "product",
      key: "product_type",
      dataIndex: "product_type",
      render(product: string) {
        let icon = <PlayCircleOutlined />;
        if (product == "RubixCompute") {
          icon = <BookOutlined />;
        }
        if (product == "RubixComputeIO") {
        }
        return (
          //BookOutlined
          icon
        );
      },
    },
    {
      title: "network",
      dataIndex: "network_uuid",
      key: "network_uuid",
      render: (network_uuid: string) => (
        <span>{getNetworkNameByUUID(network_uuid)}</span>
      ),
    },
    {
      title: "uuid",
      dataIndex: "uuid",
      key: "uuid",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, host: Host) => (
        <Space size="middle">
          <a
            onClick={() =>
              navigate(`/host/${host.uuid}`, {
                state: { connUUID: connUUID, hostUUID: host.uuid },
              })
            }
          >
            View-Device
          </a>
          <a
            onClick={() => {
              showModal(host);
            }}
          >
            Edit
          </a>
          <a
            onClick={() => {
              deleteHost(host.uuid);
            }}
          >
            Delete
          </a>
          <a
            onClick={() => {
              setSelectedHost(host), setCollapsed(!collapsed);
            }}
          >
            <MenuFoldOutlined />
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setCollapsed(true);
    const totalPage = Math.ceil(hosts.length / 10);
    setTotalPage(totalPage);
    sidePanelHeightHandle();
  }, [hosts.length]);

  useEffect(() => {
    setCollapsed(true);
    sidePanelHeightHandle();
  }, [currentPage]);

  const deleteHost = async (uuid: string) => {
    await DeleteHost(connUUID, uuid);
    refreshList();
  };

  const getNetworkNameByUUID = (uuid: string) => {
    const network = networks.find((l: Location) => l.uuid === uuid);
    return network ? network.name : "";
  };

  const onChange: PaginationProps["onChange"] = ({ current }: any) => {
    setCurrentPage(current);
  };

  const sidePanelHeightHandle = () => {
    if (currentPage === totalPage) {
      const height = (hosts.length % 10) * 103 + 55; //get height of last page
      setSidePanelHeight(height);
    } else {
      const height =
        hosts.length > 10 ? 10 * 103 + 55 : (hosts.length % 10) * 103 + 55;
      setSidePanelHeight(height);
    }
  };

  return (
    <div className="hosts-table">
      <RbTable
        rowKey="uuid"
        dataSource={hosts}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
        className={collapsed ? "full-width" : "uncollapsed-style"}
        onChange={onChange}
      />
      <SidePanel
        collapsed={collapsed}
        selectedHost={selectedHost}
        connUUID={connUUID}
        sidePanelHeight={sidePanelHeight}
      />
    </div>
  );
};
