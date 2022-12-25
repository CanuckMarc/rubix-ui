import { Spin } from "antd";
import { useState } from "react";
import { model } from "../../../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import RbTable from "../../../../../common/rb-table";
import { RbAddButton } from "../../../../../common/rb-table-actions";

import Device = model.Device;

export const BacnetWhoIsTable = (props: any) => {
  const { data, isFetching, handleAdd, addBtnText, headers } = props;
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<Device>);

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

  return (
    <>
      <RbAddButton handleClick={Add} text={addBtnText} />
      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={data}
        columns={headers}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </>
  );
};
