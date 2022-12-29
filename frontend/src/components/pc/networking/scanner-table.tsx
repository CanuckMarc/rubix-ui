import { Spin } from "antd";
import { useState, useEffect } from "react";
import { GetPcGetNetworksSchema } from "../../../../wailsjs/go/backend/App";
import RbTable from "../../../common/rb-table";

export const ScannerTable = (props: any) => {
  let { data, isFetching, rowKey, extraColumns } = props;
  const [schema, setSchema] = useState([]);
  if (!data) return <></>;

  let columns = schema.sort((a: any, b: any) => {
    if (a.key < b.key) {
      return -1;
    }
    if (a.key > b.key) {
      return 1;
    }
    return 0;
  });

  if (extraColumns && extraColumns.length > 0) {
    columns = extraColumns.concat(columns);
  }

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log(selectedRowKeys, selectedRows);
    },
    onSelect: (record: any, selected: any, selectedRows: any) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
      console.log(selected, selectedRows, changeRows);
    },
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    const res = await GetPcGetNetworksSchema();
    setSchema(res);
  };

  return (
    <RbTable
      rowKey={rowKey ? rowKey : "interface"}
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      loading={{ indicator: <Spin />, spinning: isFetching }}
    />
  );
};
