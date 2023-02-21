import { useState } from "react";
import { Spin } from "antd";
import { backend, storage } from "../../../../wailsjs/go/models";
import { BackupFactory } from "../factory";
import { RbDeleteButton, RbExportButton } from "../../../common/rb-table-actions";
import RbTable from "../../../common/rb-table";
import { BACKUP_HEADERS } from "../../../constants/headers";
import { RbSearchInput } from "../../../common/rb-search-input";

export const BackupsTable = (props: any) => {
  const { data, isFetching, fetch } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<backend.UUIDs>);
  const [filteredData, setFilteredData] = useState<storage.Backup[]>([]);

  const backupFactory = new BackupFactory();
  const columns = BACKUP_HEADERS;

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const bulkDelete = async () => {
    await backupFactory.BulkDelete(selectedUUIDs);
    fetch();
  };

  const handleExport = async () => {
    try {
      const backup = selectedUUIDs[0] as any;
      await backupFactory.Export(backup.uuid);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <RbExportButton handleExport={handleExport} disabled={selectedUUIDs.length !== 1} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {data?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        dataSource={data?.length > 0 ? filteredData : []}
        columns={columns}
        rowSelection={rowSelection}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
