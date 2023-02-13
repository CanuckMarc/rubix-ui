import { Typography, Card, Tabs } from "antd";
import { FlownetMap } from "./flownet-map"
import { BacnetMap } from "./bacnet-map"

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
  existingBacnetName: string;
  instanceNumber: number | undefined;
  outputTopic: string | undefined;
  key: string;
  bacnetSchema: node.Schema
}

export const WiresMap = () => {
  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
          Wires Map
      </Title>
      <Card bordered={false}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={flownetTab} key={flownetTab}>
            <FlownetMap />        
          </TabPane>

          <TabPane tab={bacnetTab} key={bacnetTab}>
            <BacnetMap />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
}

export default WiresMap;
