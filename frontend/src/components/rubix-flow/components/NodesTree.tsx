import { Layout } from "antd";
import { useEffect, useState } from "react";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";

const { Sider } = Layout;

type NodeProps = {
  nodes: NodeInterface[];
  selectedSubFlowId?: string;
};

export const NodesTree = ({ nodes, selectedSubFlowId }: NodeProps) => {
  const [panelKeys, setPanelKeys] = useState<string[]>([]);

  const nodeLevel1 = nodes.filter((n) => !n.parentId);
  const remainingNodes = nodes.filter((n) => !nodeLevel1.some((n2) => n2.id === n.id));

  const changeKeys = (key: string) => {
    const isExist = panelKeys.includes(key);
    setPanelKeys(isExist ? panelKeys.filter((item) => item !== key) : [...panelKeys, key]);
  };

  useEffect(() => {
    setPanelKeys([...(window.subFlowIds || [])]);
  }, [selectedSubFlowId]);

  return (
    <div>
      <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
        <div className="p-2">Nodes</div>
        <div className="overflow-y-scroll" style={{ height: "calc(100vh - 70px)" }}>
          {nodeLevel1.map((node, index) => (
            <NodeTreeItem
              key={node.id}
              node={node}
              nodeIndex={index}
              panelKeys={panelKeys}
              onChangeKey={changeKeys}
              allNodes={remainingNodes}
              selectedSubFlowId={selectedSubFlowId}
            />
          ))}
        </div>
      </Sider>
    </div>
  );
};
