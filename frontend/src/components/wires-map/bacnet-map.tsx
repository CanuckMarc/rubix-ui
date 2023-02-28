import { Card, Select, Button, Table, Input, InputNumber, Spin } from "antd";
import { useState, useEffect, ChangeEvent } from "react";
import { PlusOutlined, MinusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useBacnetStore, PointTableType } from "../../App";
import { ROUTES } from "../../constants/routes";
import { node } from "../../../wailsjs/go/models";
import type { ColumnsType } from "antd/es/table";
import { generateUuid } from "../rubix-flow/lib/generateUuid";
import { openNotificationWithIcon } from "../../utils/utils";
import { BacnetTableDataType, BacnetMapPropType, ExistingBacnetMapNodes } from "./map";
import { BacnetPointTable } from "./views/bacnetPointTable";
import { FlowFactory } from "../rubix-flow/factory";
import { NodeInterface } from "../rubix-flow/lib/Nodes/NodeInterface";

export interface BacnetPointTablePropType {
  title: string;
  pointsPaneSearch: string | undefined;
  pointList: PointTableType[];
  rowKeysToAddBack: BacnetTableDataType[] | undefined;
  pointsToRemove: PointTableType[] | undefined;
  clearSelection: boolean;
  setClearSelection: Function;
  setPointSelection: Function;
}

export interface ExistingSet {
  setId: string;
  flowPoint: node.Schema | undefined;
  inputNumber: node.Schema | undefined;
  outputNumber: node.Schema | undefined;
  analogVariable: node.Schema | undefined;
}

export interface ExistingSetTableData {
  key: string;
  setId: string;
  flowPointName: string | undefined;
  topic: string | undefined;
  instanceNumber: number | undefined;
  analogVariableName: string | undefined;
  nodesArray: (node.Schema | undefined)[];
}

export const BacnetMap = (props: BacnetMapPropType) => {
  const {
    connUUID,
    hostUUID,
    fetchFlownet,
    isFetchingFlownet,
    reset,
    pointList,
    flowNetList,
    flowNetOptionList,
    existingBacnetMappingNodes,
  } = props;
  const nav = useNavigate();
  const [clearSelection, setClearSelection] = useState(false);
  const [tableData, setTableData] = useState<BacnetTableDataType[]>([]);
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedExistingSetRowKeys, setSelectedExistingSetRowKeys] = useState<React.Key[]>([]);
  const [rowKeysToAddBack, setRowKeysToAddBack] = useState<BacnetTableDataType[] | undefined>(undefined);
  const [selectedFlownet, setSelectedFlownet] = useState<node.Schema | undefined>(undefined);
  const [pointSelection, setPointSelection] = useState<PointTableType[] | undefined>(undefined);
  const [pointsToRemove, setPointsToRemove] = useState<PointTableType[] | undefined>(undefined);
  const [bacnetServerNode, setBacnetServerNode] = useState({} as NodeInterface);
  const [disableAllButton, setDisableAllButton] = useState(false);
  const [instancePrefill, setInstancePrefill] = useState(1);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [pointsPaneSearch, setPointsPaneSearch] = useState<string | undefined>(undefined);
  const [existingSets, setExistingSets] = useState<ExistingSet[]>([]);
  const [existingSetsTableData, setExistingSetsTableData] = useState<ExistingSetTableData[]>([]);
  const [existingSetsToRemove, setExistingSetsToRemove] = useState<ExistingSetTableData[]>([]);

  const [bacnetNodes, setBacnetNodes, bacnetNodesToDelete, setBacnetNodesToDelete] = useBacnetStore((state) => [
    state.bacnetNodes,
    state.setBacnetNodes,
    state.bacnetNodesToDelete,
    state.setBacnetNodesToDelete,
  ]);

  const flowFactory = new FlowFactory();
  const isRemote = !!connUUID && !!hostUUID;

  const cleanUp = () => {
    setBacnetNodes([]);
    reset();
    fetchFlownet();
    searchExistingBacnet();
    setInstancePrefill(1);
  };

  useEffect(() => {
    cleanUp();
  }, [connUUID, hostUUID]);

  useEffect(() => {
    let existingSets: ExistingSet[] = [];
    if (
      existingBacnetMappingNodes &&
      existingBacnetMappingNodes.flowPoints &&
      existingBacnetMappingNodes.flowPoints.length !== 0
    ) {
      existingBacnetMappingNodes.flowPoints.forEach((flowPoint: node.Schema) => {
        let existingSetId: string | undefined = undefined;
        let existingSet = {} as ExistingSet;
        if (flowPoint.settings && flowPoint.settings.setId) {
          existingSetId = flowPoint.settings.setId;
          existingSet.setId = flowPoint.settings.setId;
          existingSet.flowPoint = flowPoint;
        }
        if (existingSetId) {
          existingSet.inputNumber = existingBacnetMappingNodes.inputNumbers.find((inputNumber: node.Schema) => {
            return inputNumber.settings && inputNumber.settings.setId && inputNumber.settings.setId === existingSetId
              ? true
              : false;
          });
          existingSet.outputNumber = existingBacnetMappingNodes.outputNumbers.find((outputNumber: node.Schema) => {
            return outputNumber.settings && outputNumber.settings.setId && outputNumber.settings.setId === existingSetId
              ? true
              : false;
          });
          existingSet.analogVariable = existingBacnetMappingNodes.analogVariables.find(
            (analogVariable: node.Schema) => {
              return analogVariable.settings &&
                analogVariable.settings.setId &&
                analogVariable.settings.setId === existingSetId
                ? true
                : false;
            }
          );
        }
        existingSets.push(existingSet);
      });
    }
    setExistingSets(existingSets);
  }, [existingBacnetMappingNodes]);

  useEffect(() => {
    let tableData: ExistingSetTableData[] = [];
    if (existingSets.length !== 0) {
      existingSets.forEach((set: ExistingSet) => {
        let tableEntry = {} as ExistingSetTableData;
        tableEntry.key = set.setId;
        tableEntry.setId = set.setId;
        tableEntry.flowPointName = set.flowPoint?.nodeName;
        tableEntry.topic = set.inputNumber?.settings!.topic;
        tableEntry.instanceNumber = set.analogVariable?.settings!["instance-number"];
        tableEntry.analogVariableName = set.analogVariable?.nodeName;
        tableEntry.nodesArray = [set.flowPoint, set.inputNumber, set.outputNumber, set.analogVariable];
        tableData.push(tableEntry);
      });
    }
    setExistingSetsTableData(tableData);
  }, [existingSets]);

  const searchExistingBacnet = async () => {
    const bacnetNodes = await flowFactory.GetFlowByNodeType(connUUID, hostUUID, "bacnet/bacnet-server", isRemote);
    if (bacnetNodes.nodes && bacnetNodes.nodes.length > 0) {
      setDisableAllButton(false);
      setBacnetServerNode(bacnetNodes.nodes[0]);
    } else {
      setDisableAllButton(true);
      openNotificationWithIcon("warning", "No existing BACnet server in wires sheet!");
    }
  };

  const addPoints = () => {
    if (!selectedFlownet || !pointSelection)
      openNotificationWithIcon("warning", "Please select a flow network and or a point!");
    if (selectedFlownet && pointSelection) {
      setPointsToRemove(pointSelection);
      let tempTableDataArray: BacnetTableDataType[] = [];
      let counter = instancePrefill;
      pointSelection.forEach((point: PointTableType) => {
        // test to see if selected bacnet node is already added to the table
        const temp = tableData.find((item) => item.selectedPointName === point.name);
        if (!temp) {
          let resObj = {} as BacnetTableDataType;
          const newId = generateUuid();
          resObj = {
            existingFlowNetName: selectedFlownet?.nodeName ? selectedFlownet?.nodeName : selectedFlownet?.id,
            selectedPoint: point,
            selectedPointName: point.name,
            outputTopic: point.name,
            instanceNumber: counter,
            key: newId,
            flownetSchema: selectedFlownet,
            bacnetServerInterface: bacnetServerNode,
            avName: point.name.split(":").splice(1, 4).join(" "),
          };
          counter += 1;
          tempTableDataArray.push(resObj);
        } else {
          openNotificationWithIcon("warning", "Already added!");
        }
      });
      setInstancePrefill(counter);
      setTableData([...tableData, ...tempTableDataArray]);
      // clear inputs after adding a pair of points
      setSelectValue(null);
      setClearSelection(true);
      setSelectedFlownet(undefined);
    }
  };

  const deletePoints = () => {
    const removedItems: BacnetTableDataType[] = [];
    const updatedData: BacnetTableDataType[] = tableData.filter((item) => {
      let flag = true;
      selectedRowKeys.forEach((rowKey) => {
        if (item.key === rowKey) {
          flag = false;
          removedItems.push(item);
        }
      });
      return flag;
    });
    setRowKeysToAddBack(removedItems);
    setTableData(updatedData);
    setSelectedRowKeys([]);
  };

  const deleteExistingMapping = () => {
    const removedItems: ExistingSetTableData[] = [];
    const updatedData: ExistingSetTableData[] = existingSetsTableData.filter((item) => {
      let flag = true;
      selectedExistingSetRowKeys.forEach((rowKey) => {
        if (item.key === rowKey) {
          flag = false;
          removedItems.push(item);
        }
      });
      return flag;
    });
    setExistingSetsToRemove([...existingSetsToRemove, ...removedItems]);
    setExistingSetsTableData(updatedData);
    setSelectedExistingSetRowKeys([]);
  };

  const recordPoints = () => {
    setBacnetNodes(tableData);
    setBacnetNodesToDelete(existingSetsToRemove);
    nav(ROUTES.RUBIX_FLOW_REMOTE.replace(":connUUID", connUUID).replace(":hostUUID", hostUUID));
  };

  const handleChange = (value: string) => {
    setSelectValue(value);
    setSelectedFlownet(flowNetList.find((item: node.Schema) => item.id === value));
  };

  const onInstanceNumberChange = (value: number | null, record: BacnetTableDataType) => {
    if (record) {
      let objCopy = record;
      let tableDataCopy = tableData;
      objCopy.instanceNumber = value ? value : undefined;
      tableData.forEach((obj, index) => {
        if (obj.key === record.key) {
          tableDataCopy[index] = objCopy;
        }
      });
      setTableData(tableDataCopy);
    }
  };

  const onOutputTopicChange = (event: ChangeEvent<HTMLInputElement>, record: BacnetTableDataType) => {
    event.stopPropagation();
    const value = event?.target.value;
    if (record) {
      let objCopy = record;
      let tableDataCopy = tableData;
      objCopy.outputTopic = value ? value : undefined;
      tableData.forEach((obj, index) => {
        if (obj.key === record.key) {
          tableDataCopy[index] = objCopy;
        }
      });
      setTableData(tableDataCopy);
    }
  };

  const onAvNameChange = (event: ChangeEvent<HTMLInputElement>, record: BacnetTableDataType) => {
    event.stopPropagation();
    const value = event?.target.value;
    if (record) {
      let objCopy = record;
      let tableDataCopy = tableData;
      objCopy.avName = value ? value : undefined;
      tableData.forEach((obj, index) => {
        if (obj.key === record.key) {
          tableDataCopy[index] = objCopy;
        }
      });
      setTableData(tableDataCopy);
    }
  };

  const columns: ColumnsType<BacnetTableDataType> = [
    {
      title: "Flow network name",
      dataIndex: "existingFlowNetName",
      key: "existingFlowNetName",
      width: "300px",
      render: (text, record: BacnetTableDataType, index) => {
        return record?.existingFlowNetName || "Flow network name unspecified.";
      },
    },
    {
      title: "Point name",
      dataIndex: "selectedPointName",
      key: "selectedPointName",
      render: (text, record: BacnetTableDataType, index) => {
        return record?.selectedPointName || "Point name unspecified.";
      },
    },
    {
      title: "Link output number topic",
      dataIndex: "outputTopic",
      key: "outputTopic",
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <Input
            defaultValue={record.outputTopic}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onOutputTopicChange(event, record)}
          />
        );
      },
    },
    {
      title: "Analog variable instance number",
      dataIndex: "instanceNumber",
      key: "instanceNumber",
      width: "200px",
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <InputNumber
            defaultValue={record.instanceNumber}
            style={{ width: "100%" }}
            onChange={(value: number | null) => onInstanceNumberChange(value, record)}
          />
        );
      },
    },
    {
      title: "Analog variable node name",
      dataIndex: "avName",
      key: "avName",
      render: (text, record: BacnetTableDataType, index) => {
        return (
          <Input
            defaultValue={record.avName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onAvNameChange(event, record)}
          />
        );
      },
    },
  ];

  const existingSetColumns: ColumnsType<ExistingSetTableData> = [
    {
      title: "Flow Point Name",
      dataIndex: "flowPointName",
      key: "flowPointName",
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Instance Number",
      dataIndex: "instanceNumber",
      key: "instanceNumber",
    },
    {
      title: "Analog Variable Name",
      dataIndex: "analogVariableName",
      key: "analogVariableName",
    },
  ];

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onSelectExistingSetChange = (selectedExistingSetRowKeys: React.Key[]) => {
    setSelectedExistingSetRowKeys(selectedExistingSetRowKeys);
  };

  const rowSelectionExistingSet = {
    selectedExistingSetRowKeys,
    onChange: onSelectExistingSetChange,
  };

  const onSearchBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    if (event.target.value === "") {
      setSearch(undefined);
      setPointsPaneSearch(undefined);
    }
  };

  const handleSearchPointName = () => {
    setPointsPaneSearch(search);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2vw" }}>
      <Card bordered={true}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "30px", alignItems: "center" }}>
            <strong>Select flow network: </strong>
            <Select
              showSearch
              allowClear
              value={selectValue}
              style={{ width: "500px" }}
              placeholder="Please select"
              onChange={handleChange}
              options={flowNetOptionList}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "center" }}>
            <strong>Search by point name: </strong>
            <Input
              placeholder="search by point name"
              disabled={pointList.length === 0}
              allowClear={true}
              value={search}
              onChange={onSearchBarChange}
              onPressEnter={handleSearchPointName}
              style={{ width: "500px" }}
            />
          </div>

          {disableAllButton && (
            <span style={{ color: "orange", fontSize: "18px" }}>
              Warning: No existing BACnet server in wires sheet!
            </span>
          )}

          <Spin spinning={isFetchingFlownet} style={{ width: "100%" }}>
            <BacnetPointTable
              title={"Point"}
              pointsPaneSearch={pointsPaneSearch}
              pointList={pointList}
              rowKeysToAddBack={rowKeysToAddBack}
              pointsToRemove={pointsToRemove}
              clearSelection={clearSelection}
              setClearSelection={setClearSelection}
              setPointSelection={setPointSelection}
            />
          </Spin>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2vh", alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: "1vw", alignItems: "center" }}>
                <strong>Selected points:</strong>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addPoints}
                  disabled={disableAllButton}
                  size={"middle"}
                  style={{ width: "6vw" }}
                >
                  Add
                </Button>
                <Button
                  type="primary"
                  icon={<MinusOutlined />}
                  danger={true}
                  onClick={deletePoints}
                  disabled={disableAllButton || tableData.length === 0 || selectedRowKeys.length === 0}
                  size={"middle"}
                  style={{ width: "6vw" }}
                >
                  Delete
                </Button>
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
              <div style={{ display: "flex", flexDirection: "row", gap: "1vw", alignItems: "center" }}>
                <strong>Existing mappings:</strong>
                <Button
                  type="primary"
                  icon={<MinusOutlined />}
                  danger={true}
                  onClick={deleteExistingMapping}
                  disabled={
                    disableAllButton || existingSetsTableData.length === 0 || selectedExistingSetRowKeys.length === 0
                  }
                  size={"middle"}
                  style={{ width: "6vw" }}
                >
                  Delete
                </Button>
              </div>
              <Table
                bordered={true}
                columns={existingSetColumns}
                dataSource={existingSetsTableData}
                rowSelection={rowSelectionExistingSet}
                pagination={{
                  position: ["bottomRight"],
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 50, 100, 1000],
                  locale: { items_per_page: "" },
                }}
              />
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={recordPoints}
                size={"large"}
                disabled={disableAllButton || (tableData.length === 0 && existingSetsToRemove.length === 0)}
                style={{ width: "15vw" }}
              >
                Generate point connections
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
