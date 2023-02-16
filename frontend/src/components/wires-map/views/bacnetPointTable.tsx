import { Table } from "antd";
import { useState, useEffect } from "react";
import { backend } from "../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { PointTableType } from '../../../App';
import { BacnetPointTablePropType } from '../bacnet-map';
import { BacnetTableDataType } from '../map';
import { openNotificationWithIcon } from "../../../utils/utils";

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

export const BacnetPointTable = (props: BacnetPointTablePropType) => {
  const {title, pointsPaneSearch, pointList, rowKeysToAddBack, pointsToRemove, clearSelection, setClearSelection, setPointSelection} = props
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<PointTableType[]>([]);
  const [removedData, setRemovedData] = useState<PointTableType[]>([]);
  const [beforesearch, setBeforesearch] = useState<PointTableType[]>([]);
  const [allNames, setAllNames] = useState<Array<Array<MenuItemsType>>>([]);

  const types = ['plugin', 'network', 'device', 'point']

  useEffect(() => {
    if (pointsPaneSearch && pointsPaneSearch !== "") {
      setBeforesearch(tableData);
      let temp: PointTableType[] = [];
      tableData.forEach((item: PointTableType) => {
        if (item.name.toLowerCase().includes(pointsPaneSearch)) {
          temp.push(item);
        }
      });

      if (temp.length === 0) {
        setTableData(beforesearch)
        openNotificationWithIcon("warning", 'No result matches your search.');
      } else {
        setTableData(temp);
      }
    } else {
      setTableData(beforesearch)
    }
    // console.log('to show: ', tableData)
    // console.log('to track: ', beforesearch)
  }, [pointsPaneSearch])

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
    setBeforesearch(mappedList);
    setAllNames(localAllNames);
  }, [pointList])

  useEffect(() => {
    if (pointsToRemove) {
      const filteredTableData = tableData.filter((item: PointTableType) => {
        let flag = true
        pointsToRemove.forEach((removeItem: PointTableType) => {
          if (item.uuid === removeItem.uuid) flag = false 
        })
        return flag
      })

      const filteredBeforeSearchTableData = beforesearch.filter((item: PointTableType) => {
        let flag = true
        pointsToRemove.forEach((removeItem: PointTableType) => {
          if (item.uuid === removeItem.uuid) flag = false 
        })
        return flag
      })

      setTableData(filteredTableData);
      setBeforesearch(filteredBeforeSearchTableData);
      setRemovedData([...removedData, ...pointsToRemove]);
    }
  }, [pointsToRemove])

  useEffect(() => {
    if (rowKeysToAddBack) {
      let rowsToAddBack: PointTableType[] = []
      rowKeysToAddBack.forEach((key: BacnetTableDataType) => {
        removedData.forEach((item: PointTableType) => {
          if(key.selectedPoint.key === item.key) rowsToAddBack.push(item)
        })
      })
      setTableData([...tableData, ...rowsToAddBack]);
      setBeforesearch([...beforesearch, ...rowsToAddBack]);

      const filteredRemovedData = removedData.filter((i: PointTableType) => {
        let flag = true
        rowsToAddBack.forEach((j: PointTableType) => {
          if (i.uuid === j.uuid) flag = false
        })
        return flag
      })
      setRemovedData(filteredRemovedData);
    }
  }, [rowKeysToAddBack])

  useEffect(() => {
    if (clearSelection) {
      setSelectedRowKeys([]);
      setPointSelection(undefined);
      setClearSelection(false);
    }
  }, [clearSelection])

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
    let selectedItems: PointTableType[] = []
    newSelectedRowKeys.forEach(i => {
      tableData.forEach(j => {
        if (j.uuid === i) {
          selectedItems.push(j)
        }
      })
    })
    setPointSelection(newSelectedRowKeys.length === 0 ? undefined : selectedItems)
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
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
