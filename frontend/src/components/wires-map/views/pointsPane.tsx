import { Table } from "antd";
import { useState, useEffect } from "react";
import { model } from "../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { PointTableType } from '../../../App';

export const PointsPane = (props: any) => {
    const {title, pointList, clearSelection, setClearSelection, selectedPoints, setSelectedPoints} = props
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [ownSelection, setOwnSelection] = useState<PointTableType | undefined>(undefined);
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
        }
        setTableData(mappedList)
    }, [pointList])

    useEffect(() => {
        if (clearSelection) {
            setSelectedRowKeys([]);
            setOwnSelection(undefined);
            setSelectedPoints(undefined);
            setClearSelection(false);
        }
    }, [clearSelection])

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
        setSelectedRowKeys(newSelectedRowKeys);
        let selectedItems: PointTableType = {} as PointTableType
        newSelectedRowKeys.forEach(i => {
            tableData.forEach(j => {
                if (j.uuid === i) {
                    selectedItems = j
                }
            })
        })
        setSelectedPoints(selectedItems)
        if (newSelectedRowKeys.length === 0) {
            setOwnSelection(undefined)
        } else {
            setOwnSelection(selectedItems)
        }
    };

    const rowSelection = {
        hideSelectAll: true,
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record: PointTableType) => {
            if (ownSelection === undefined) {
                if (selectedPoints && record.uuid === selectedPoints.uuid) {
                    return {disabled: true}
                } else {
                    return {disabled: false}
                }
            } else {
                if (record.uuid === ownSelection.uuid) {
                    return {disabled: false}
                } else {
                    return {disabled: true}
                }
            }
        }
    }


    return (
        <>
            <Table 
                bordered={true}
                columns={columns} 
                dataSource={tableData} 
                style={{ width: '45%' }}
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
