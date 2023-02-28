import { Typography, Card, Tabs } from "antd";
import { FlownetMap } from "./flownet-map";
import { BacnetMap } from "./bacnet-map";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from "../../components/hosts/host/flow/points/factory";

import { useStore, useIsLoading, PointTableTypeRecord, PointTableType } from "../../App";
import { node } from "../../../wailsjs/go/models";
import { NodeInterface } from "../rubix-flow/lib/Nodes/NodeInterface";

const { Title } = Typography;
const { TabPane } = Tabs;

const flownetTab = "Flow network mapping";
const bacnetTab = "BACnet mapping";

export interface SelectOptionType {
  value: string;
  label: string;
}

export interface AddedPointType {
  existingFlowNetName: string | undefined;
  pointOneName: string;
  pointTwoName: string;
  key: string;
}

export interface BacnetTableDataType {
  existingFlowNetName: string;
  selectedPoint: PointTableType;
  selectedPointName: string;
  instanceNumber: number | undefined;
  outputTopic: string | undefined;
  key: string;
  flownetSchema: node.Schema;
  bacnetServerInterface: NodeInterface;
  avName: string | undefined;
}

export interface FlownetMapPropType {
  connUUID: string;
  hostUUID: string;
  reset: Function;
  fetch: Function;
  isFetching: boolean;
  pointList: PointTableType[];
  flowNetList: node.Schema[];
  flowNetOptionList: SelectOptionType[];
}

export interface BacnetMapPropType {
  connUUID: string;
  hostUUID: string;
  reset: Function;
  fetchFlownet: Function;
  isFetchingFlownet: boolean;
  pointList: PointTableType[];
  flowNetList: node.Schema[];
  flowNetOptionList: SelectOptionType[];
  existingBacnetMappingNodes: ExistingBacnetMapNodes | undefined;
}

export interface ExistingBacnetMapNodes {
  flowPoints: node.Schema[];
  inputNumbers: node.Schema[];
  outputNumbers: node.Schema[];
  analogVariables: node.Schema[];
}

export const WiresMap = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [isFetching, setIsFetching] = useState(false);
  const [pointList, setPointList] = useState<PointTableType[]>([]);
  const [flowNetList, setFlowNetList] = useState<node.Schema[]>([]);
  const [flowNetOptionList, setFlowNetOptionList] = useState<SelectOptionType[]>([]);
  const [existingBacnetMappingNodes, setExistingBacnetMappingNodes] = useState<ExistingBacnetMapNodes | undefined>(
    undefined
  );

  const mappingFactory = new MappingFactory();
  const pointFactory = new FlowPointFactory();
  const isRemote = !!connUUID && !!hostUUID;

  const [refreshCounter, reset, incrementRefreshCounter] = useIsLoading((state) => [
    state.refreshCounter,
    state.reset,
    state.incrementRefreshCounter,
  ]);

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetch();
  }, [connUUID, hostUUID]);

  const fetchNodeByType = async (type: string) => {
    return await mappingFactory.GetNodesByType(connUUID, hostUUID, type, isRemote);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await pointFactory.GetPointListPayload(connUUID, hostUUID);
      setPointList(
        res.map((item) => ({
          key: item.uuid,
          name: item.name,
          uuid: item.uuid,
          device_name: item.device_name,
          network_name: item.network_name,
          plugin_name: item.plugin_name,
          point_name: item.point_name,
        }))
      );
      const flowNetRes = await mappingFactory.GetNodesAllFlowNetworks(connUUID, hostUUID, isRemote);
      if (flowNetRes) {
        setFlowNetList(flowNetRes);
        setFlowNetOptionList(
          flowNetRes.map((item: any) => ({
            value: item.id,
            label: item.hasOwnProperty("nodeName") ? item.nodeName : item.id,
          }))
        );
      }
      let resObj = {} as ExistingBacnetMapNodes;
      resObj.flowPoints = await mappingFactory.GetNodesByType(connUUID, hostUUID, "flow/flow-point", isRemote);
      resObj.inputNumbers = await mappingFactory.GetNodesByType(connUUID, hostUUID, "link/link-input-number", isRemote);
      resObj.outputNumbers = await mappingFactory.GetNodesByType(
        connUUID,
        hostUUID,
        "link/link-output-number",
        isRemote
      );
      resObj.analogVariables = await mappingFactory.GetNodesByType(
        connUUID,
        hostUUID,
        "bacnet/analog-variable",
        isRemote
      );
      setExistingBacnetMappingNodes(resObj);
    } catch (error) {
      console.log("error is: ", error);
      setPointList([]);
      setFlowNetOptionList([]);
      setExistingBacnetMappingNodes(undefined);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Mapping
      </Title>
      <Card bordered={false}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={flownetTab} key={flownetTab}>
            <FlownetMap
              connUUID={connUUID}
              hostUUID={hostUUID}
              fetch={fetch}
              isFetching={isFetching}
              reset={reset}
              pointList={pointList}
              flowNetList={flowNetList}
              flowNetOptionList={flowNetOptionList}
            />
          </TabPane>

          <TabPane tab={bacnetTab} key={bacnetTab}>
            <BacnetMap
              connUUID={connUUID}
              hostUUID={hostUUID}
              fetchFlownet={fetch}
              isFetchingFlownet={isFetching}
              reset={reset}
              pointList={pointList}
              flowNetList={flowNetList}
              flowNetOptionList={flowNetOptionList}
              existingBacnetMappingNodes={existingBacnetMappingNodes}
            />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default WiresMap;
