import { Collapse } from "antd";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

const { Panel } = Collapse;

type NodeProps = {
  allNodes: NodeInterface[];
  childNodes: NodeInterface[];
};

export const NodeTreeItem = ({ allNodes, childNodes }: NodeProps) => {
  return (
    <Collapse expandIconPosition="right" className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0">
      {childNodes?.map((node, index) => {
        const nodesChild: NodeInterface[] = allNodes.filter((item: NodeInterface) => item.parentId === node.id);
        const type = node.type!!.split("/")[1];

        return node.isParent ? (
          <Panel
            key={index}
            header={type}
            className="panel-no-padding border-gray-600"
            style={{ paddingLeft: !node.parentId ? undefined : 24 }}
          >
            <div className="bg-gray-800">
              <NodeTreeItem childNodes={nodesChild} allNodes={allNodes} />
            </div>
          </Panel>
        ) : (
          <div
            key={index}
            className={`py-2 cursor-po inter flex flex-row justify-between text-left ant-menu-item border-gray-600 ${
              index === 0 ? "" : "border-t"
            }`}
          >
            <div>{type}</div>
          </div>
        );
      })}
    </Collapse>
  );
};
