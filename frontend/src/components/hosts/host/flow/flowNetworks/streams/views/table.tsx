import { Space, Spin, Tooltip } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";
import { FlowStreamFactory } from "../factory";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import RbTable from "../../../../../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { ROUTES } from "../../../../../../../constants/routes";
import { STREAM_HEADERS } from "../../../../../../../constants/headers";
import { CreateEditModal } from "./create";

import UUIDs = backend.UUIDs;
import Stream = model.Stream;
import { RbSearchInput } from "../../../../../../../common/rb-search-input";

export const StreamsTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const { connUUID = "", hostUUID = "", netUUID = "", locUUID = "", flNetworkUUID = "" } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [schema, setSchema] = useState({});
  const [currentItem, setCurrentItem] = useState({} as Stream);
  const [filteredData, setFilteredData] = useState(data);

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const factory = new FlowStreamFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const columns = [
    {
      key: "actions",
      title: "Actions",
      fixed: "left",
      render: (_: any, item: Stream) => (
        <Space size="middle">
          <Link to={getNavigationLink(item.uuid)}>
            <Tooltip title="View Producers">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
          <Tooltip title="Edit">
            <a onClick={() => showModal(item)}>
              <FormOutlined />
            </a>
          </Tooltip>
        </Space>
      ),
    },
    ...STREAM_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const getSchema = () => {
    const schema = {
      properties: {
        name: {
          maxLength: 100,
          minLength: 0,
          title: "name",
          type: "string",
        },
        enable: {
          title: "enable",
          type: "boolean",
          default: true,
        },
      },
    };
    setSchema(schema);
  };

  const getNavigationLink = (streamUUID: string): string => {
    return ROUTES.PRODUCERS.replace(":connUUID", connUUID)
      .replace(":locUUID", locUUID)
      .replace(":netUUID", netUUID)
      .replace(":hostUUID", hostUUID)
      .replace(":flNetworkUUID", flNetworkUUID)
      .replace(":streamUUID", streamUUID);
  };

  const showModal = (item: Stream) => {
    setCurrentItem(item);
    setIsModalVisible(true);
    getSchema();
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentItem({} as Stream);
  };

  return (
    <>
      <RbRefreshButton refreshList={refreshList} />
      <RbAddButton handleClick={() => showModal({} as Stream)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        schema={schema}
        currentItem={currentItem}
        isModalVisible={isModalVisible}
        refreshList={refreshList}
        onCloseModal={onCloseModal}
      />
    </>
  );
};
