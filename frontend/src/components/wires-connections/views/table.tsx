import { Space, Spin } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../../wailsjs/go/models";
import { RbSearchInput } from "../../../common/rb-search-input";
import RbTable from "../../../common/rb-table";
import { RbAddButton, RbDeleteButton } from "../../../common/rb-table-actions";
import { WIRES_CONNECTIONS_HEADERS, WIRES_CONNECTION_SCHEMA } from "../../../constants/headers";
import { FlowFactory } from "../../rubix-flow/factory";
import { CreateModal } from "./create";
import { EditModal } from "./edit";

import Connection = db.Connection;

export const WiresConnectionsTable = (props: any) => {
  const { data, isFetching, refreshList } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<string>);
  const [currentItem, setCurrentItem] = useState({} as Connection);
  const [schema, setSchema] = useState({});
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState(data);

  const isRemote = !!connUUID && !!hostUUID;

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const factory = new FlowFactory();

  const columns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, connection: Connection) => (
        <Space size="middle">
          <a onClick={() => showEditModal(connection)}>Edit</a>
        </Space>
      ),
    },
    ...WIRES_CONNECTIONS_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRowKeys);
    },
  };

  const bulkDelete = async () => {
    try {
      await factory.BulkDeleteWiresConnection(connUUID, hostUUID, isRemote, selectedUUIDs);
    } catch (error) {
      console.log(error);
    } finally {
      refreshList();
    }
  };

  const showCreateModal = () => {
    const schema = {
      properties: WIRES_CONNECTION_SCHEMA,
    };
    setSchema(schema);
    setIsCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const showEditModal = (item: Connection) => {
    setCurrentItem(item);
    const schema = {
      properties: WIRES_CONNECTION_SCHEMA,
    };
    setSchema(schema);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setCurrentItem({} as Connection);
  };

  return (
    <>
      <RbAddButton handleClick={showCreateModal} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateModal
        isModalVisible={isCreateModalVisible}
        schema={schema}
        onCloseModal={closeCreateModal}
        refreshList={refreshList}
      />
      <EditModal
        currentItem={currentItem}
        isModalVisible={isEditModalVisible}
        schema={schema}
        onCloseModal={closeEditModal}
        refreshList={refreshList}
      />
    </>
  );
};
