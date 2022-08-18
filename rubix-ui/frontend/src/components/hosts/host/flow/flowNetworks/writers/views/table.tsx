import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Space, Spin } from "antd";
import { main, model } from "../../../../../../../../wailsjs/go/models";
import { WritersFactory } from "../factory";
import { FlowConsumerFactory } from "../../consumers/factory";
import { WRITER_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbRefreshButton,
} from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";

import UUIDs = main.UUIDs;
import Writer = model.Writer;
import Consumer = model.Consumer;

export const WritersTable = () => {
  const { connUUID = "", hostUUID = "", consumerUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [writers, setWriters] = useState([] as Writer[]);
  const [thingClass, setThingClass] = useState<any>();
  const [currentItem, setCurrentItem] = useState({} as Writer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new WritersFactory();
  const consumerFactory = new FlowConsumerFactory();
  factory.connectionUUID = consumerFactory.connectionUUID = connUUID;
  factory.hostUUID = consumerFactory.hostUUID = hostUUID;

  const columns = [
    ...WRITER_HEADERS,
    {
      title: "actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, item: Writer) => (
        <Space size="middle">
          <a
            onClick={() => {
              showModal(item);
            }}
          >
            Edit
          </a>
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

  const showModal = async (item: Writer) => {
    if (!thingClass && (!item || !item.uuid)) {
      await setNewItem();
    } else {
      item.writer_thing_class = item.writer_thing_class ?? thingClass;
      setCurrentItem(item);
    }
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentItem({} as Writer);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setWriters(res);
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

  const setNewItem = async () => {
    const item = new Writer();
    const consumer = await consumerFactory.GetOne(consumerUUID);
    item.writer_thing_class = consumer.producer_thing_class;
    setThingClass(consumer.producer_thing_class); //avoid calling get consumer endpoint again
    setCurrentItem(item);
  };

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      <RbAddButton handleClick={() => showModal({} as Writer)} />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={writers}
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
