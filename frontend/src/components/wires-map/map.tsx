import { Typography, Card, Tabs } from "antd";
import { FlownetMap } from "./flownet-map"
import { BacnetMap } from "./bacnet-map"
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';

import { useStore, useIsLoading, PointTableTypeRecord, PointTableType } from '../../App';
import { node } from "../../../wailsjs/go/models";

const { Title } = Typography;
const { TabPane } = Tabs;

const flownetTab = "Flow network mapping";
const bacnetTab = "Bacnet mapping";

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
  bacnetSchema: node.Schema
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
}

export const WiresMap = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [isFetching, setIsFetching] = useState(false);
  const [pointList, setPointList] = useState<PointTableType[]>([]);
  const [flowNetList, setFlowNetList] = useState<node.Schema[]>([]);
  const [flowNetOptionList, setFlowNetOptionList] = useState<SelectOptionType[]>([]);

  const mappingFactory = new MappingFactory();
  const pointFactory = new FlowPointFactory();
  const isRemote = !!connUUID && !!hostUUID;

  const [refreshCounter, reset, incrementRefreshCounter] = useIsLoading(
    (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
  )

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetch();
}, [connUUID, hostUUID]);

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

  

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
          Wires Map
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
            />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
}

export default WiresMap;
