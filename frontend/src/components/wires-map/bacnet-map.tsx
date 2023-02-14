import { Typography, Card, Select, Button, Table, Input, InputNumber, Spin } from "antd";
import { useState, useEffect, ChangeEvent } from "react";
import { PlusOutlined, MinusOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import { useIsLoading, useBacnetStore, PointTableType } from '../../App';
import { ROUTES } from "../../constants/routes";
import { node } from "../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { generateUuid } from "../rubix-flow/lib/generateUuid";
import { openNotificationWithIcon } from "../../utils/utils";
import { BacnetTableDataType, BacnetMapPropType } from "./map";
import { BacnetPointTable } from "./views/bacnetPointTable";
import { FlowFactory } from "../rubix-flow/factory"
import { NodeInterface } from "../rubix-flow/lib/Nodes/NodeInterface";

const { Title } = Typography;

export const BacnetMap = (props: BacnetMapPropType) => {
  const {connUUID, hostUUID, fetchFlownet, isFetchingFlownet, reset, pointList, flowNetList, flowNetOptionList} = props
  const nav = useNavigate();
  const [clearSelection, setClearSelection] = useState(false);
  const [tableData, setTableData] = useState<BacnetTableDataType[]>([]);
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedFlownet, setSelectedFlownet] = useState<node.Schema | undefined>(undefined);
  const [pointSelection, setPointSelection] = useState<PointTableType | undefined>(undefined);
  const [bacnetServerNode, setBacnetServerNode] = useState({} as NodeInterface);
  const [disableAllButton, setDisableAllButton] = useState(false);

  const [bacnetNodes, setBacnetNodes] = useBacnetStore(
    (state) => [state.bacnetNodes, state.setBacnetNodes]
  )

  const flowFactory = new FlowFactory();
  const isRemote = !!connUUID && !!hostUUID;

  useEffect(() => {
      setBacnetNodes([]);
      reset();
      fetchFlownet();
      searchExistingBacnet();
  }, [connUUID, hostUUID]);

  const searchExistingBacnet = async () => {
    const bacnetNodes = await flowFactory.GetFlowByNodeType(connUUID, hostUUID, 'bacnet/bacnet-server', isRemote)
    if (bacnetNodes.nodes && bacnetNodes.nodes.length > 0) {
      setDisableAllButton(false)
      setBacnetServerNode(bacnetNodes.nodes[0])
    } else {
      setDisableAllButton(true)
      openNotificationWithIcon("warning", 'No existing Bacnet server in Wires sheet!');
    }
  }

  const addPoints = () => {
    if (!selectedFlownet || !pointSelection) openNotificationWithIcon("warning", 'Please select a flow network and or a point!');
    if (selectedFlownet && pointSelection){
      // test to see if selected bacnet node is already added to the table
      const temp = tableData.find(item => item.selectedPointName === pointSelection.name)
      if (!temp) {
        let resObj = {} as BacnetTableDataType
        const newId = generateUuid()
        resObj = {
          existingFlowNetName: selectedFlownet?.nodeName ? selectedFlownet?.nodeName : selectedFlownet?.id,
          selectedPoint: pointSelection,
          selectedPointName: pointSelection.name,
          outputTopic: pointSelection.name,
          instanceNumber: undefined,
          key: newId,
          flownetSchema: selectedFlownet,
          bacnetServerInterface: bacnetServerNode
        }
        setTableData([...tableData, resObj])
      } else {
        openNotificationWithIcon("warning", 'Already added!');
      }
      // clear inputs after adding a pair of points
      setSelectValue(null);
      setClearSelection(true);
      setSelectedFlownet(undefined);
    }
  }

  const deletePoints = () => {
    const updatedData: BacnetTableDataType[] = tableData.filter(item => {
      let flag = true;
      selectedRowKeys.forEach(rowKey => {
          if (item.key === rowKey) {
              flag = false;
          }
      })
      return flag
    })

    setTableData(updatedData)
    setSelectedRowKeys([])
  }

  const recordPoints = () => {
    setBacnetNodes(tableData)
    nav(ROUTES.RUBIX_FLOW_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID))
  }

  const handleChange = (value: string) => {
    setSelectValue(value);
    setSelectedFlownet(flowNetList.find((item: node.Schema) => item.id === value));
  };

  const onInstanceNumberChange = (value: number | null, record: BacnetTableDataType) => {
    if (record) {
      let objCopy = record;
      let tableDataCopy = tableData;
      value ? objCopy.instanceNumber = value : objCopy.instanceNumber = undefined;
      tableData.forEach((obj, index) => {
        if (obj.key === record.key) {
          tableDataCopy[index] = objCopy
        }
      })
      setTableData(tableDataCopy)
    }
  }

  const onOutputTopicChange = (event: ChangeEvent<HTMLInputElement>, record: BacnetTableDataType) => {
    event.stopPropagation();
    const value = event?.target.value;
    if (record) {
      let objCopy = record;
      let tableDataCopy = tableData;
      value ? objCopy.outputTopic = value : objCopy.outputTopic = undefined;
      tableData.forEach((obj, index) => {
        if (obj.key === record.key) {
          tableDataCopy[index] = objCopy
        }
      })
      setTableData(tableDataCopy)
    } 
  }

  const columns: ColumnsType<BacnetTableDataType> = [
    {
      title: 'Flow network',
      dataIndex: 'existingFlowNetName',
      key: 'existingFlowNetName',
      render: (text, record: BacnetTableDataType, index) => {
        return record?.existingFlowNetName || 'Flow network name unspecified.'
      }
    },
    {
      title: 'Point',
      dataIndex: 'selectedPointName',
      key: 'selectedPointName',
      render: (text, record: BacnetTableDataType, index) => {
        return record?.selectedPointName || 'Point name unspecified.'
      }
    },
    {
      title: 'Link output number topic',
      dataIndex: 'outputTopic',
      key: 'outputTopic',
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <Input defaultValue={record.outputTopic} onChange={(event: ChangeEvent<HTMLInputElement>) => onOutputTopicChange(event, record)} />
        );
      }
    },
    {
      title: 'Analog variable instance number',
      dataIndex: 'instanceNumber',
      key: 'instanceNumber',
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <InputNumber style={{width: '100%'}} onChange={(value: number | null) => onInstanceNumberChange(value, record)} />
        );
      }
    }
  ]

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };


  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2vw'}}>
      <Card bordered={true}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '2vh'}}>
          <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center'}}>
            <Title level={5}>Select flow network: </Title>
            <Select
              showSearch
              allowClear
              value={selectValue}
              style={{ width: '50%' }}
              placeholder="Please select"
              onChange={handleChange}
              options={flowNetOptionList}
            />
          </div>
          <Spin spinning={isFetchingFlownet} style={{ width: '100%' }}>
            <BacnetPointTable 
              title={'Point'} 
              pointList={pointList} 
              // pairToAdd={pairToAdd} 
              // pairToRemove={pairToRemove} 
              clearSelection={clearSelection} 
              setClearSelection={setClearSelection} 
              pointSelection={pointSelection}
              setPointSelection={setPointSelection}
              // selectedPoints={selectedPointsTwo} 
              // setSelectedPoints={setSelectedPointsOne}
            />  
            
          </Spin>



          <div style={{display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'stretch'}}>

            <div style={{display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'stretch'}}>
              <div style={{display: 'flex', flexDirection: 'row', gap: '1vw', alignItems: 'center'}}>
                <Title level={5}>
                  Selected points: 
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={addPoints} disabled={disableAllButton} size={'middle'} style={{width: '6vw'}}>Add</Button>
                <Button type="primary" icon={<MinusOutlined />} danger={true} onClick={deletePoints} disabled={disableAllButton || tableData.length === 0 || selectedRowKeys.length === 0} size={'middle'} style={{width: '6vw'}}>Delete</Button>
              </div>
              <Table 
                bordered={true}
                columns={columns} 
                dataSource={tableData} 
                rowSelection={rowSelection}
                pagination={{
                  position: ["bottomRight"],
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 50, 100, 1000],
                  locale: { items_per_page: "" },
                }}
              />
              <Button type="primary" icon={<UploadOutlined />} onClick={recordPoints} size={'large'} disabled={disableAllButton || tableData.length === 0} style={{width: '15vw'}}>Generate point connections</Button>
            </div>
          </div> 
        </div>
      </Card>
    </div>
  );
}