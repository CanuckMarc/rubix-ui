import { Space, Tooltip, Spin, Popconfirm } from "antd";
import { DeleteOutlined, FormOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chirpstack } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton } from "../../../common/rb-table-actions";
import { LORAWAN_REMOTE_HEADERS } from "../../../constants/headers";
import { ChirpFactory } from "../factory";
import { CreateEditModal } from "./create";

import DevicesResult = chirpstack.DevicesResult;

export const LorawanTable = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState<DevicesResult[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<DevicesResult | undefined>(undefined);

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

  const showModal = (dev: DevicesResult | undefined) => {
    setCurrentItem(dev);
    setIsModalVisible(true);
  };
  const handleClose = () => {
    setIsModalVisible(false);
    setCurrentItem(undefined);
  };

  useEffect(() => {
    fetch();
  }, [connUUID, hostUUID]);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal(undefined)} />

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
    </>
  );
};
