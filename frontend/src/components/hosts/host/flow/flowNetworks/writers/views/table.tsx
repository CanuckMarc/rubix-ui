import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Space, Spin, Tooltip } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { WritersFactory } from "../factory";
import { FlowConsumerFactory } from "../../consumers/factory";
import { WRITER_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import {
  RbAddButton,
  RbDeleteButton,
  RbRefreshButton,
  RbSyncButton
} from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";
import { FormOutlined } from "@ant-design/icons";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import { hasError } from "../../../../../../../utils/response";
import { openNotificationWithIcon } from "../../../../../../../utils/utils";
import UUIDs = backend.UUIDs;
import Writer = model.Writer;

export const WritersTable = () => {
  const { connUUID = "", hostUUID = "", consumerUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [writers, setWriters] = useState([] as Writer[]);
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
  factory.consumerUUID = consumerUUID;

  const columns = [
    {
      key: "actions",
      title: "Actions",
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
    setCurrentItem(item);
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
      setWriters(res?.writers || []);
      setFilteredData(res?.writers || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const sync = async () => {
    try {
      setIsFetching(true);
      const res = await factory.Sync(consumerUUID);
      if (hasError(res)) {
        openNotificationWithIcon("error", res.msg);
      } else {
        openNotificationWithIcon("success", res.data);
      }
      await fetch();
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

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbSyncButton onClick={sync} />
      <RbAddButton handleClick={() => showModal({} as Writer)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {writers?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={writers?.length > 0 ? filteredData : []}
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
