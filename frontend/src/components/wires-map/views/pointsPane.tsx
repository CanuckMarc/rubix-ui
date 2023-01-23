import { Typography, Card, Select, Spin, Table } from "antd";
import { useState, useEffect } from "react";
import type { ColumnsType } from 'antd/es/table';

import { model } from "../../../../wailsjs/go/models";

interface PointTableType {
    key: string;
    name: string;
    uuid: string;
}

export const PointsPane = (props: any) => {
    const {title, pointList} = props
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [tableData, setTableData] = useState<PointTableType[]>([])

    useEffect(() => {
        let mappedList: PointTableType[] = []
        if(pointList.length > 0) {
            mappedList = pointList.map((item: model.Point) => {
                return {
                    key: item.uuid,
                    name: item.name,
                    uuid: item.uuid
                }
            })
            setTableData(mappedList)
        }
    }, [pointList])

    const columns: ColumnsType<PointTableType> = [
        {
            title: title,
            dataIndex: 'name',
            key: 'name',
            fixed: 'left'
        },
        {
            title: 'uuid',
            dataIndex: 'uuid',
            key: 'uuid',
            fixed: 'left'
        }
    ]

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        hideSelectAll: true,
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record: PointTableType) => {
            // console.log(record.name)
            return {
                disabled: record.name == "point-7ccd5"
            };
        }
    };

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={tableData} 
                style={{ width: '40%' }}
                rowSelection={rowSelection}
                pagination={{
                    position: ["bottomCenter"],
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 50, 100, 1000],
                    locale: { items_per_page: "" },
                }}
                // scroll={{ x: 'max-content', y: '50vh' }}
            />
        </>
    );
}
export default PointsPane;