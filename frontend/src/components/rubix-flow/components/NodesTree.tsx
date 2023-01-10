import { Layout } from "antd";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";

const { Sider } = Layout;

type NodeProps = {
  nodes: NodeInterface[];
};

export const NodesTree = ({ nodes }: NodeProps) => {
  return (
    <div>
      <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
        <div className="p-2">Nodes</div>
        <div className="overflow-y-scroll" style={{ height: "calc(100vh - 70px)" }}>
          <NodeTreeItem childNodes={nodes.filter((item) => !item.parentId)} allNodes={nodes} />
        </div>
      </Sider>
    </div>
  );
};
