import { Table } from "antd";
import { useState, useEffect } from "react";
import { backend } from "../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { PointTableType } from '../../../App';
import { AddedPointType } from "../map";

interface MenuItemsType {
  text: string;
  value: string;
}

const addNameToArray = (name: string, array: MenuItemsType[], type: string) => {
  const item: MenuItemsType = {
    text: name,
    value: `${type}:${name}`
  }
  if(!array.some((item: MenuItemsType) => {
    return item.text === name
  })) {
    array.push(item)
  }
}

export const BacnetPointTable = (props: any) => {
  const {title, pointList, clearSelection, setClearSelection, pointSelection, setPointSelection} = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // const [ownSelection, setOwnSelection] = useState<PointTableType | undefined>(undefined);
  // const [removedItem, setRemovedItem] = useState<PointTableType[]>([]);
  const [tableData, setTableData] = useState<PointTableType[]>([]);
  const [allNames, setAllNames] = useState<Array<Array<MenuItemsType>>>([]);

  const types = ['plugin', 'network', 'device', 'point']

  useEffect(() => {
    let mappedList: PointTableType[] = []
    let localAllNames: Array<Array<MenuItemsType>> = [[], [], [], []]
    if(pointList.length > 0) {
      mappedList = pointList.map((item: backend.PointListPayload) => {
        const nameArray = item.name.split(':');
        nameArray.forEach((name: string, index: number) => {
          addNameToArray(name, localAllNames[index], types[index])
        })

        return {
          key: item.uuid,
          name: item.name,
          uuid: item.uuid,
          device_name: item.device_name,
          network_name: item.network_name,
          plugin_name: item.plugin_name,
          point_name: item.point_name
        }
      })
    }
    setTableData(mappedList);
    setAllNames(localAllNames);
  }, [pointList])

  useEffect(() => {
    if (clearSelection) {
      setSelectedRowKeys([]);
      setPointSelection(undefined);
      setClearSelection(false);
    }
  }, [clearSelection])

//   useEffect(() => {
//     let temp: PointTableType[] = []
//     if (pairToRemove !== undefined) {
//       const updatedTableData = tableData.filter(item => {
//         if (item.uuid !== pairToRemove[0].uuid && item.uuid !== pairToRemove[1].uuid) {
//           return true
//         } else {
//           temp.push(item)
//           return false
//         }
//       })

//       setTableData(updatedTableData);
//       setRemovedItem([...removedItem, ...temp]);
//     }
//   }, [pairToRemove])

//   useEffect(() => {
//     const rowsToAddBack: PointTableType[] = []
//     if (pairToAdd !== undefined) {
//         pairToAdd.forEach((item: AddedPointType) => {
//             removedItem.forEach(el => {
//                 if (el.name === item.pointOneName || el.name === item.pointTwoName) {
//                     rowsToAddBack.push(el);
//                 }
//             })
//         });
//         setTableData([...tableData, ...rowsToAddBack])

//         const temp = removedItem.filter(item => {
//             let flag = true;
//             rowsToAddBack.forEach(el => {
//                 if (item.uuid === el.uuid) {
//                     flag = false;
//                 }
//             })
//             return flag
//         })
//         setRemovedItem(temp)
//     }
//   }, [pairToAdd])

  const columns: ColumnsType<PointTableType> = [
    {
      title: title,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      filters: [
        {
          text: 'Plugin name',
          value: 'Plugin name',
          children: allNames[0]
        },
        {
          text: 'Network name',
          value: 'Network name',
          children: allNames[1]
        },
        {
          text: 'Device name',
          value: 'Device name',
          children: allNames[2]
        },
        {
          text: 'Point name',
          value: 'Point name',
          children: allNames[3]
        },
        ],
        filterMode: 'tree',
        filterSearch: true,
        onFilter: (value: any, record: PointTableType) => {
          let flag = false
          const [type, name] = value.split(':');
          const index = types.indexOf(type);
          if (record.name.split(':')[index] === name) {
            flag = true
          }
          return flag
        }
    },
    {
      title: 'plugin',
      dataIndex: 'plugin_name',
      key: 'plugin_name',
      fixed: 'left'
    },
    {
      title: 'network',
      dataIndex: 'network_name',
      key: 'network_name',
      fixed: 'left'
    },
    {
      title: 'device',
      dataIndex: 'device_name',
      key: 'device_name',
      fixed: 'left'
    },
    {
      title: 'point',
      dataIndex: 'point_name',
      key: 'point_name',
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
    setPointSelection(newSelectedRowKeys.length === 0 ? undefined : selectedItems)
  };

  const rowSelection = {
    hideSelectAll: true,
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: PointTableType) => {
      if (pointSelection) {
        return {disabled: record.uuid !== pointSelection?.uuid}
      } else {
        return {disabled: false}
      }
    }
  }

  return (
    <Table 
      bordered={true}
      columns={columns} 
      dataSource={tableData} 
      style={{ width: '100%' }}
      rowSelection={rowSelection}
      pagination={{
          position: ["bottomCenter"],
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 50, 100, 1000],
          locale: { items_per_page: "" },
      }}
    />  
  );
}
export default BacnetPointTable;
