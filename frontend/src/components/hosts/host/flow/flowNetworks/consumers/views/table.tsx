import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Space, Spin } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { FlowConsumerFactory } from "../factory";
import { CONSUMER_HEADERS } from "../../../../../../../constants/headers";
import { ROUTES } from "../../../../../../../constants/routes";
import RbTable from "../../../../../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";

import UUIDs = backend.UUIDs;
import Consumer = model.Consumer;

export const ConsumersTable = (props: any) => {
  const {
    connUUID = "",
    hostUUID = "",
    locUUID = "",
    netUUID = "",
    flNetworkCloneUUID = "",
    streamCloneUUID = "",
  } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [consumers, setConsumers] = useState([] as Consumer[]);
  const [currentItem, setCurrentItem] = useState({} as Consumer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowConsumerFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    ...CONSUMER_HEADERS,
    {
      title: "actions",
      key: "actions",
      fixed: "right",
      render: (_: any, item: Consumer) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>View Writers</Link>
          <a onClick={() => showModal(item)}>Edit</a>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  useEffect(() => {
    fetch();
  }, []);

  const showModal = (item: Consumer) => {
    setCurrentItem(item);
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentItem({} as Consumer);
  };

  const getNavigationLink = (consumerUUID: string): string => {
    return ROUTES.WRITERS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkCloneUUID", flNetworkCloneUUID)
      .replace(":streamCloneUUID", streamCloneUUID)
      .replace(":consumerUUID", consumerUUID);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll(false);
      setConsumers(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    fetch();
  };

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as Consumer)} />
      <RbDeleteButton bulkDelete={bulkDelete} />

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={consumers}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        currentItem={currentItem}
        isModalVisible={isModalVisible}
        refreshList={fetch}
        onCloseModal={onCloseModal}
      />
    </>
  );
};
