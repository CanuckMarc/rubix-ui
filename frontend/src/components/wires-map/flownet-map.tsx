import { Typography, Card, Select, Spin, Button, Table, Tabs } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, MinusOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import { PointsPane } from "./views/pointsPane";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';
import { useStore, useIsLoading, PointTableTypeRecord, PointTableType } from '../../App';
import { ROUTES } from "../../constants/routes";
import { node } from "../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { generateUuid } from "../rubix-flow/lib/generateUuid";
import { openNotificationWithIcon } from "../../utils/utils";
import { SelectOptionType, AddedPointType } from "./map";

const { Title } = Typography;

const filterForFullObj = (pointList: PointTableType[], selectedPoints: PointTableType) => {
  const filteredPoint = pointList.filter(item => {
    if (item.uuid === selectedPoints.uuid) {
      return item
    }
  })
  return filteredPoint[0]
}

export const FlownetMap = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const nav = useNavigate();
  const [isFetching, setIsFetching] = useState(false);
  const [clearSelection, setClearSelection] = useState(false);
  const [tableData, setTableData] = useState<AddedPointType[]>([]);
  const [pointList, setPointList] = useState<PointTableType[]>([]);
  const [flowNetList, setFlowNetList] = useState<node.Schema[]>([]);
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [flowNetOptionList, setFlowNetOptionList] = useState<SelectOptionType[]>([]);
  const [selectedFlowNet, setSelectedFlowNet] = useState<node.Schema | undefined>(undefined);
  const [selectedPointsOne, setSelectedPointsOne] = useState<PointTableType | undefined>(undefined);
  const [selectedPointsTwo, setSelectedPointsTwo] = useState<PointTableType | undefined>(undefined);
  const [pairToRemove, setPairToRemove] = useState<PointTableType[] | undefined>(undefined);
  const [pairToAdd, setPairToAdd] = useState<AddedPointType[] | undefined>(undefined);

  const mappingFactory = new MappingFactory();
  const pointFactory = new FlowPointFactory();

  const isRemote = !!connUUID && !!hostUUID;

  const [wiresMapNodes, setWiresMapNodes] = useStore(
    (state) => [state.wiresMapNodes, state.setWiresMapNodes]
  )

  const [refreshCounter, reset, incrementRefreshCounter] = useIsLoading(
    (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
  )

  const fetch = async() => {
    try {
        setIsFetching(true);
        const res = await pointFactory.GetPointListPayload(connUUID, hostUUID);
        setPointList(res.map(item => ({
            key: item.uuid,
            name: item.name,
            uuid: item.uuid,
            device_name: item.device_name,
            network_name: item.network_name,
            plugin_name: item.plugin_name,
            point_name: item.point_name
        })));
        const flowNetRes = await mappingFactory.GetNodesAllFlowNetworks(connUUID, hostUUID, isRemote)
        if (flowNetRes) {
            setFlowNetList(flowNetRes)
            setFlowNetOptionList(flowNetRes.map((item: any) => ({
                value: item.id,
                label: item.hasOwnProperty('nodeName') ? item.nodeName : item.id
            })))
        }
    } catch (error) {
        setPointList([]);
    } finally {
        setIsFetching(false);
    }
  }

  useEffect(() => {
      pointFactory.connectionUUID = connUUID;
      pointFactory.hostUUID = hostUUID;
      setWiresMapNodes([]);
      reset();
      fetch();
  }, [connUUID, hostUUID]);

  const addPoints = () => {
    if (!selectedPointsOne || 
        !selectedPointsTwo || 
        !selectedFlowNet || 
        Object.keys(selectedPointsOne).length === 0 ||
        Object.keys(selectedPointsTwo).length === 0
    ) openNotificationWithIcon("warning", 'Please select a flow network and both points!');
    if (selectedPointsOne && 
        selectedPointsTwo && 
        selectedFlowNet && 
        Object.keys(selectedPointsOne).length !== 0 && 
        Object.keys(selectedPointsTwo).length !== 0
    ){
        const resObj = {} as PointTableTypeRecord
        const newId = generateUuid()
        resObj['pointOne'] = filterForFullObj(pointList, selectedPointsOne)
        resObj['pointTwo'] = filterForFullObj(pointList, selectedPointsTwo)
        resObj['existingFlowNet'] = selectedFlowNet
        resObj['id'] = newId

        setWiresMapNodes([...wiresMapNodes, resObj])
        setTableData([...tableData, {
            existingFlowNetName: resObj.existingFlowNet?.nodeName ? resObj.existingFlowNet?.nodeName : resObj.existingFlowNet?.id,
            pointOneName: resObj.pointOne.name,
            pointTwoName: resObj.pointTwo.name,
            key: newId
        }])

        setPairToRemove([resObj['pointOne'], resObj['pointTwo']])

        // clear inputs after adding a pair of points
        setClearSelection(true);
    }
  }

  const deletePoints = () => {
    let updatedStoreData: PointTableTypeRecord[] = wiresMapNodes.filter(item => {
      let flag = true;
      selectedRowKeys.forEach(rowKey => {
          if (item.id === rowKey) {
              flag = false;
          }
      })
      return flag
    })
    setWiresMapNodes(updatedStoreData)

    let pointsToRestore: AddedPointType[] = []
    const updatedTableData: AddedPointType[] = tableData.filter(row => {
      let flag = true;
      selectedRowKeys.forEach(rowKey => {
          if (row.key === rowKey) {
              pointsToRestore.push(row)
              flag = false;
          }
      })
      return flag
    })
    setTableData(updatedTableData)
    setPairToAdd(pointsToRestore)

    setSelectedRowKeys([])
  }

  const recordPoints = () => {
    nav(ROUTES.RUBIX_FLOW_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID))
  }

  const handleChange = (value: string) => {
    setSelectValue(value);
    setSelectedFlowNet(flowNetList.find((item: node.Schema) => item.id === value ));
  };

  const columns: ColumnsType<AddedPointType> = [
    {
      title: 'Flow network',
      dataIndex: 'existingFlowNetName',
      key: 'existingFlowNetName',
      fixed: 'left',
      render: (text, record: AddedPointType, index) => {
        return record?.existingFlowNetName || 'Flow network unselected, please select one.'
      }
    },
    {
      title: 'Point one',
      dataIndex: 'pointOneName',
      key: 'pointOneName',
      fixed: 'left'
    },
    {
      title: 'Point two',
      dataIndex: 'pointTwoName',
      key: 'pointTwoName',
      fixed: 'left'
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
          <Spin spinning={isFetching} style={{ width: '100%' }}>
            <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center', justifyContent: 'space-around'}}>
              <PointsPane title={'Point one'} pointList={pointList} pairToAdd={pairToAdd} pairToRemove={pairToRemove} clearSelection={clearSelection} setClearSelection={setClearSelection} selectedPoints={selectedPointsTwo} setSelectedPoints={setSelectedPointsOne}/>
              <PointsPane title={'Point two'} pointList={pointList} pairToAdd={pairToAdd} pairToRemove={pairToRemove} clearSelection={clearSelection} setClearSelection={setClearSelection} selectedPoints={selectedPointsOne} setSelectedPoints={setSelectedPointsTwo}/>
            </div>
          </Spin>
        </div>
      </Card>

      <div style={{display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'stretch'}}>
        <Card bordered={true}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'stretch'}}>
            <div style={{display: 'flex', flexDirection: 'row', gap: '1vw', alignItems: 'center'}}>
              <Title level={5}>
                Selected points: 
              </Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={addPoints} size={'middle'} style={{width: '6vw'}}>Add</Button>
              <Button type="primary" icon={<MinusOutlined />} danger={true} onClick={deletePoints} disabled={tableData.length === 0 || selectedRowKeys.length === 0} size={'middle'} style={{width: '6vw'}}>Delete</Button>
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
            <Button type="primary" icon={<UploadOutlined />} onClick={recordPoints} size={'large'} disabled={tableData.length === 0} style={{width: '15vw'}}>Generate point connections</Button>
          </div>
        </Card>
      </div>  
    </div>
  );
}