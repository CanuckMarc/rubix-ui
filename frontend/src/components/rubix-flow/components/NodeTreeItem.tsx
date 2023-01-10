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
        const type = node.type!!.split("/")[1] + (node.info && (node.info.nodeName !== "") ? ` (${node.info?.nodeName})` : "");

        return node.isParent ? (
          <Panel
            key={index}
            header={type}
            className={`panel-no-padding border-gray-600 border-t border-b-0 `}
            style={{ paddingLeft: !node.parentId ? undefined : 10 }}
          >
            <div className="bg-gray-800">
              <NodeTreeItem childNodes={nodesChild} allNodes={allNodes} />
            </div>
          </Panel>
        ) : (
          <div
            key={index}
            className={`py-2 cursor-po inter flex flex-row justify-between text-left ant-menu-item border-gray-600 ${index === 0 ? "" : "border-t"}`}
            style={{ paddingLeft: !node.parentId ? undefined : 26 }}
          >
            <div>{type}</div>
          </div>
        );
      })}
    </Collapse>
  );
};
