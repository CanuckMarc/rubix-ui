import { Typography, Card, Select, Spin, Table } from "antd";
import { useState, useEffect } from "react";
import { model } from "../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { PointTableType } from '../map';

export const PointsPaneTwo = (props: any) => {
    const {pointList, selectedPoints, setSelectedPoints} = props;
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [tableData, setTableData] = useState<PointTableType[]>([]);

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
        }
        setTableData(mappedList)
    }, [pointList])

    const columns: ColumnsType<PointTableType> = [
        {
            title: 'Point two',
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
        let selectedItems: PointTableType[] = []
        newSelectedRowKeys.forEach(i => {
            tableData.forEach(j => {
                if (j.uuid === i) {
                    selectedItems.push(j)
                }
            })
        })
        setSelectedPoints(selectedItems)
    };

    const rowSelection = {
        hideSelectAll: true,
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record: PointTableType) => {
            let flag = false;
            if (selectedPoints.length > 0) {
                selectedPoints.forEach((item: PointTableType) => {
                    if (record.uuid === item.uuid) {
                        flag = true
                    }
                });
                return {
                    disabled: flag
                };
            } else {
                return {disabled: flag}
            }
        }
    };

    return (
        <>
            <Table 
                bordered={true}
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
export default PointsPaneTwo;
