import Table from "antd/lib/table";

const DISPLAY_MAX_WIDTH = "max-content";

const RbTable = (props: any) => {
  return (
    <Table
      {...props}
      scroll={{ x: DISPLAY_MAX_WIDTH }}
      pagination={{
        position: ["bottomLeft"],
        showSizeChanger: true,
        pageSizeOptions: [10, 50, 100, 1000],
        locale: { items_per_page: "" },
      }}
      showSorterTooltip={false}
      tableLayout="auto"
      style={{ whiteSpace: "nowrap" }} //keep one row
    />
  );
};

export default RbTable;
