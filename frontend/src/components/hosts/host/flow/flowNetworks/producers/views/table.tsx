import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Space, Spin } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { FlowProducerFactory } from "../factory";
import { PRODUCER_HEADERS } from "../../../../../../../constants/headers";
import { ROUTES } from "../../../../../../../constants/routes";
import RbTable from "../../../../../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";

import UUIDs = backend.UUIDs;
import Producer = model.Producer;

export const ProducersTable = (props: any) => {
  const { connUUID = "", locUUID = "", netUUID = "", hostUUID = "", flNetworkUUID = "", streamUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [producers, setProducers] = useState([] as Producer[]);
  const [currentItem, setCurrentItem] = useState({} as Producer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowProducerFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, item: Producer) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>View Writer Clones</Link>
          <a onClick={() => showModal(item)}>Edit</a>
        </Space>
      ),
    },
    ...PRODUCER_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  useEffect(() => {
    fetch();
  }, []);

  const showModal = (item: Producer) => {
    setCurrentItem(item);
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentItem({} as Producer);
  };

  const getNavigationLink = (producerUUID: string): string => {
    return ROUTES.WRITERCLONES.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkUUID", flNetworkUUID)
      .replace(":streamUUID", streamUUID)
      .replace(":producerUUID", producerUUID);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setProducers(res);
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
      <RbAddButton handleClick={() => showModal({} as Producer)} />
      <RbDeleteButton bulkDelete={bulkDelete} />

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={producers}
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
