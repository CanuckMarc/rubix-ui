import { Tabs } from "antd";
import { TakeSnapshot } from "./take-snapshot";
import { RestoreSnapshot } from "./restore-snapshot";

const { TabPane } = Tabs;

const takeSnapshot = "Take Snapshot";
const restoreSnapshot = "Restore Snapshot";

export const Snapshots = () => {
  return (
    <Tabs defaultActiveKey={takeSnapshot}>
      <TabPane tab={takeSnapshot} key={takeSnapshot}>
        <TakeSnapshot />
      </TabPane>
      <TabPane tab={restoreSnapshot} key={restoreSnapshot}>
        <RestoreSnapshot />
      </TabPane>
    </Tabs>
  );
};
