import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Space, Spin, Tooltip } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { FlowConsumerFactory } from "../factory";
import { CONSUMER_HEADERS } from "../../../../../../../constants/headers";
import { ROUTES } from "../../../../../../../constants/routes";
import RbTable from "../../../../../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { CreateEditModal } from "./create";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import { hasError } from "../../../../../../../utils/response";
import { openNotificationWithIcon } from "../../../../../../../utils/utils";
import UUIDs = backend.UUIDs;
import Consumer = model.Consumer;

export const ConsumersTable = () => {
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
  const [filteredData, setFilteredData] = useState<Consumer[]>([]);
  const [currentItem, setCurrentItem] = useState({} as Consumer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowConsumerFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;
  factory.streamCloneUUID = streamCloneUUID;

  const config = {
    originData: consumers,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, item: Consumer) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>
            <Tooltip title="View Writers">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
          <a onClick={() => showModal(item)}>
            <Tooltip title="Edit">
              <FormOutlined />
            </Tooltip>
          </a>
        </Space>
      ),
    },
    ...CONSUMER_HEADERS,
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
      const res = await factory.GetAll(true, false);
      if (hasError(res)) {
        openNotificationWithIcon("error", res.msg);
        return;
      }
      setConsumers(res?.data?.consumers || []);
      setFilteredData(res?.data?.consumers || []);
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

      {consumers.length > 0 && <RbSearchInput config={config} className="mb-4" />}
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
