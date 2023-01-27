import Table from "antd/lib/table";

const DISPLAY_MAX_WIDTH = "max-content";
const DISPLAY_MAX_Height = 700;

const RbTable = (props: any) => {
  return (
    <Table
      {...props}
      rowClassName={(record: any, i) => {
        return record?.connection === "Disconnected" ? 'table-row-disconnected' : '';
      }}
      pagination={{
        position: ["bottomLeft"],
        showSizeChanger: true,
        pageSizeOptions: [10, 50, 100, 1000],
        locale: { items_per_page: "" },
      }}
      scroll={{ x: DISPLAY_MAX_WIDTH }}
      showSorterTooltip={false}
    />
  );
};

export default RbTable;
