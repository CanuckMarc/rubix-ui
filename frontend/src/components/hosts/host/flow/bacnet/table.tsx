import { Spin } from "antd";
import { useEffect, useState } from "react";
import { model } from "../../../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import RbTable from "../../../../../common/rb-table";
import { RbAddButton } from "../../../../../common/rb-table-actions";
import { RbSearchInput } from "../../../../../common/rb-search-input";

import Device = model.Device;

export const BacnetWhoIsTable = (props: any) => {
  const { data, isFetching, handleAdd, addBtnText, headers } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState<Device[]>([]);
  const [filteredData, setFilteredData] = useState<Device[]>([]);

  const config = {
    originData: data,
    setFilteredData: setFilteredData,
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const Add = () => {
    if (selectedUUIDs.length === 0) {
      return openNotificationWithIcon("warning", "Please select item first");
    }
    handleAdd(selectedUUIDs);
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <>
      <RbAddButton handleClick={Add} text={addBtnText} />
      {data.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={filteredData}
        columns={headers}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
