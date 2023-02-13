import { Typography, Card, Select, Button, Table, Input, InputNumber } from "antd";
import { useState, useEffect, ChangeEvent } from "react";
import { PlusOutlined, MinusOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';
import { useIsLoading, useBacnetStore } from '../../App';
import { ROUTES } from "../../constants/routes";
import { node } from "../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';
import { generateUuid } from "../rubix-flow/lib/generateUuid";
import { openNotificationWithIcon } from "../../utils/utils";
import { SelectOptionType, BacnetTableDataType } from "./map";

const { Title } = Typography;

export const BacnetMap = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const nav = useNavigate();
  const [isFetching, setIsFetching] = useState(false);
  const [tableData, setTableData] = useState<BacnetTableDataType[]>([]);
  const [bacnetList, setBacnetList] = useState<node.Schema[]>([]);
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bacnetOptionList, setBacnetOptionList] = useState<SelectOptionType[]>([]);
  const [selectedBacnet, setSelectedBacnet] = useState<node.Schema | undefined>(undefined);

  const mappingFactory = new MappingFactory();
  const pointFactory = new FlowPointFactory();

  const isRemote = !!connUUID && !!hostUUID;

  const [bacnetNodes, setBacnetNodes] = useBacnetStore(
    (state) => [state.bacnetNodes, state.setBacnetNodes]
  )

  const [refreshCounter, reset, incrementRefreshCounter] = useIsLoading(
    (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
  )

  const fetch = async() => {
    try {
        setIsFetching(true);
        const bacnetRes = await mappingFactory.GetBacnetNodes(connUUID, hostUUID, isRemote)
        if (bacnetRes) {
          setBacnetList(bacnetRes)
          setBacnetOptionList(bacnetRes.map((item: any) => ({
            value: item.id,
            label: item.hasOwnProperty('nodeName') ? item.nodeName : item.id
          })))
        }
    } catch (error) {
      setBacnetList([]);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
      pointFactory.connectionUUID = connUUID;
      pointFactory.hostUUID = hostUUID;
      setBacnetNodes([]);
      reset();
      fetch();
  }, [connUUID, hostUUID]);

  const addPoints = () => {
    if (!selectedBacnet) openNotificationWithIcon("warning", 'Please select a Bacnet variable node!');
    if (selectedBacnet){
      // test to see if selected bacnet node is already added to the table
      const temp = tableData.find(item => item.existingBacnetName === selectedBacnet?.nodeName || item.existingBacnetName === selectedBacnet?.id)
      if (!temp) {
        let resObj = {} as BacnetTableDataType
        const newId = generateUuid()
        resObj = {
          existingBacnetName: selectedBacnet?.nodeName ? selectedBacnet?.nodeName : selectedBacnet?.id,
          outputTopic: undefined,
          instanceNumber: undefined,
          key: newId,
          bacnetSchema: selectedBacnet
        }
        setTableData([...tableData, resObj])
      } else {
        openNotificationWithIcon("warning", 'Already added!');
      }
      // clear inputs after adding a pair of points
      setSelectValue(null);
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
    setSelectedBacnet(bacnetList.find((item: node.Schema) => item.id === value));
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
      dataIndex: 'existingBacnetName',
      key: 'existingBacnetName',
      fixed: 'left',
      render: (text, record: BacnetTableDataType, index) => {
        return record?.existingBacnetName || 'Bacnet name unspecified.'
      }
    },
    {
      title: 'Link output number topic',
      dataIndex: 'outputTopic',
      key: 'outputTopic',
      fixed: 'left',
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <Input onChange={(event: ChangeEvent<HTMLInputElement>) => onOutputTopicChange(event, record)} />
        );
      }
    },
    {
      title: 'Analog variable instance number',
      dataIndex: 'instanceNumber',
      key: 'instanceNumber',
      fixed: 'left',
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
            <Title level={5}>Select Bacnet: </Title>
            <Select
              showSearch
              allowClear
              value={selectValue}
              style={{ width: '50%' }}
              placeholder="Please select"
              onChange={handleChange}
              options={bacnetOptionList}
            />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '2vh', alignItems: 'stretch'}}>

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
          </div> 
        </div>
      </Card>
    </div>
  );
}