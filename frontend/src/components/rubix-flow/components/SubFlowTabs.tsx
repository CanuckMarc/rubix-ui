import { Tabs } from "antd";
import { FC, memo } from "react";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type SubFlowTabsProps = {
  nodes: NodeInterface[];
  selectedSubflow?: NodeInterface;
  goSubFlow: (node: NodeInterface) => void;
  onBackToMain: () => void;
};

export const SubFlowTabs: FC<SubFlowTabsProps> = memo(({ nodes, selectedSubflow, goSubFlow, onBackToMain }) => {
  const onChangeTab = (nodeId: string) => {
    if (nodeId === "main") {
      onBackToMain();
      return;
    }

    const node = nodes.find((p) => p.id === nodeId);
    if (node) {
      goSubFlow(node);
    }
  };

  return (
    <div className="subflow-tabs absolute w-full">
      <Tabs activeKey={selectedSubflow?.id || "main"} type="card" size="small" onChange={onChangeTab}>
        <Tabs.TabPane tabKey="main" tab="Main" key="main" />
        {nodes.map((item) => (
          <Tabs.TabPane tabKey={item.id} tab={item.info?.nodeName || item.type?.split("/")[1]} key={item.id} />
        ))}
      </Tabs>
    </div>
  );
});
