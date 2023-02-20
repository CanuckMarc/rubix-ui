import { Space, Tooltip, Spin, Popconfirm } from "antd";
import { DeleteOutlined, FormOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chirpstack } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton } from "../../../common/rb-table-actions";
import { LORAWAN_REMOTE_HEADERS } from "../../../constants/headers";
import { ChirpFactory } from "../factory";
import { CreateEditModal } from "./create";
import { ActiveModal } from "./active-modal";
import { AddDeviceWizard } from "./lorawan-wizard";

import DevicesResult = chirpstack.DevicesResult;

export const LorawanTable = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState<DevicesResult[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isActiveModalVisible, setIsActiveModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DevicesResult | undefined>(undefined);
  const [lastSeenAtString, setLastSeenAtString] = useState<string>("");
  const [isWizardModalVisible, setIsWizardModalVisible] = useState(false);

  const columns = [
    {
      key: "actions",
      title: "Actions",
      fixed: "left",
      render: (_: any, item: DevicesResult) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <a onClick={() => showModal(item)}>
              <FormOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm title="Delete" onConfirm={() => deleteDevice(item.devEUI)}>
              <DeleteOutlined className="danger--text" />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Active">
            <a onClick={() => showActiveModal(item)}>
              <PlayCircleOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
    ...LORAWAN_REMOTE_HEADERS,
  ];

  const factory = new ChirpFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.CSGetDevices(connUUID, hostUUID, "");
      if (res && res.result) setData(res.result);
    } catch (error) {
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const deleteDevice = async (devEui: string) => {
    await factory.CSDeleteDevice(connUUID, hostUUID, devEui);
    fetch();
  };

  const fetchGateway = async () => {
    const res = await factory.CSGetGateway(connUUID, hostUUID);
    setLastSeenAtString(res?.lastSeenAtString || "");
  };

  const showModal = (dev: DevicesResult | undefined) => {
    setCurrentItem(dev);
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsActiveModalVisible(false);
    setCurrentItem(undefined);
  };

  const showActiveModal = (dev: DevicesResult | undefined) => {
    setCurrentItem(dev);
    setIsActiveModalVisible(true);
  };

  useEffect(() => {
    fetch();
    fetchGateway();
  }, [connUUID, hostUUID]);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => setIsWizardModalVisible(true)} />
      {lastSeenAtString && (
        <div className="text-end ">
          Gateway last seen: <b>{lastSeenAtString}</b>
        </div>
      )}

      <RbTable
        rowKey="devEUI"
        dataSource={data}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        currentItem={currentItem}
        isModalVisible={isModalVisible}
        refreshList={fetch}
        onCloseModal={handleClose}
      />
      <ActiveModal
        currentItem={currentItem}
        isModalVisible={isActiveModalVisible}
        refreshList={fetch}
        onCloseModal={handleClose}
      />
      <AddDeviceWizard 
        refreshList={fetch}
        isWizardModalVisible={isWizardModalVisible}
        setIsWizardModalVisible={setIsWizardModalVisible}
      />
    </>
  );
};
