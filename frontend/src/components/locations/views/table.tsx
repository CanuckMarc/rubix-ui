import { Spin } from "antd";
import { useState } from "react";
import { backend } from "../../../../wailsjs/go/models";
import { LocationFactory } from "../factory";
import RbTable from "../../../common/rb-table";
import { RbDeleteButton } from "../../../common/rb-table-actions";
import { RbSearchInput } from "../../../common/rb-search-input";

export const LocationsTable = (props: any) => {
  const { locations = [], isFetching, tableSchema, connUUID, refreshList } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState<backend.UUIDs[]>([]);
  const [filteredData, setFilteredData] = useState(locations);

  const config = {
    originData: locations,
    setFilteredData: setFilteredData,
  };

  const factory = new LocationFactory();
  factory.connectionUUID = connUUID as string;

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    refreshList();
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  return (
    <div>
      <RbDeleteButton bulkDelete={bulkDelete} />
      {locations?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={locations?.length > 0 ? filteredData : []}
        columns={tableSchema}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </div>
  );
};
