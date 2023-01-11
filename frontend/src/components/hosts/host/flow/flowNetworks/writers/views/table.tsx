import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Space, Spin, Tooltip } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { WritersFactory } from "../factory";
import { FlowConsumerFactory } from "../../consumers/factory";
import { WRITER_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";

import UUIDs = backend.UUIDs;
import Writer = model.Writer;
import Consumer = model.Consumer;
import { RbSearchInput } from "../../../../../../../common/rb-search-input";

export const WritersTable = () => {
  const { connUUID = "", hostUUID = "", consumerUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [writers, setWriters] = useState([] as Writer[]);
  const [thingClass, setThingClass] = useState<any>();
  const [currentItem, setCurrentItem] = useState({} as Writer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [filteredData, setFilteredData] = useState<Writer[]>([]);

  const config = {
    originData: writers,
    setFilteredData: setFilteredData,
  };

  const factory = new WritersFactory();
  const consumerFactory = new FlowConsumerFactory();
  factory.connectionUUID = consumerFactory.connectionUUID = connUUID;
  factory.hostUUID = consumerFactory.hostUUID = hostUUID;

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, item: Writer) => (
        <Space size="middle">
          <a onClick={() => showModal(item)}>
            <Tooltip title="Edit">
              <FormOutlined />
            </Tooltip>
          </a>
        </Space>
      ),
    },
    ...WRITER_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

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
      setFilteredData(res);
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

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as Writer)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {writers.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={filteredData}
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
