import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { WriterClonesFactory } from "../factory";
import { WRITER_CLONE_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import { RbDeleteButton, RbRefreshButton } from "../../../../../../../common/rb-table-actions";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import UUIDs = backend.UUIDs;
import WriterClone = model.WriterClone;

export const WriterClonesTable = () => {
  const { connUUID = "", hostUUID = "", producerUUID = "" } = useParams();
  const [isFetching, setIsFetching] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [writerClones, setWriterClones] = useState([] as WriterClone[]);
  const [filteredData, setFilteredData] = useState<WriterClone[]>([]);

  const config = {
    originData: writerClones,
    setFilteredData: setFilteredData,
  };

  const factory = new WriterClonesFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;
  factory.producerUUID = producerUUID;

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetAll();
      setWriterClones(res?.writer_clones || []);
      setFilteredData(res?.writer_clones || []);
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
      <RbDeleteButton bulkDelete={bulkDelete} />
      {writerClones?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={WRITER_CLONE_HEADERS}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
