import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import { backend, model } from "../../../../../../../../wailsjs/go/models";
import { WriterClonesFactory } from "../factory";
import { WRITER_CLONE_HEADERS } from "../../../../../../../constants/headers";
import RbTable from "../../../../../../../common/rb-table";
import { RbDeleteButton, RbRefreshButton, RbSyncButton } from "../../../../../../../common/rb-table-actions";
import { RbSearchInput } from "../../../../../../../common/rb-search-input";
import { hasError } from "../../../../../../../utils/response";
import { openNotificationWithIcon } from "../../../../../../../utils/utils";
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

  const sync = async () => {
    try {
      setIsFetching(true);
      const res = await factory.Sync(producerUUID);
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
      <RbDeleteButton bulkDelete={bulkDelete} />
      {writerClones?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={writerClones?.length > 0 ? filteredData : []}
        columns={WRITER_CLONE_HEADERS}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
