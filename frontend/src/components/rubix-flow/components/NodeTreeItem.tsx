import { Collapse } from "antd";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

const { Panel } = Collapse;

type NodeProps = {
  allNodes: NodeInterface[];
  node: NodeInterface;
  panelKeys: string[];
  nodeIndex: number;
  onChangeKey: (key: string) => void;
  selectedSubFlowId?: string;
};

export const NodeTreeItem = ({ allNodes, node, panelKeys, nodeIndex, onChangeKey, selectedSubFlowId }: NodeProps) => {
  const childNodes = allNodes.filter((item) => item.parentId === node.id);
  const type = node.type!!.split("/")[1] + (node.info?.nodeName ? ` (${node.info?.nodeName})` : "");

  return (
    <Collapse
      expandIconPosition="right"
      activeKey={panelKeys}
      onChange={() => onChangeKey(node.id)}
      className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0"
    >
      {node.isParent ? (
        <Panel
          key={node.id}
          header={type}
          className={`panel-no-padding border-gray-600 border-t border-b-0 ${
            node.id === selectedSubFlowId ? "tree-active" : ""
          }`}
          style={{
            paddingLeft: !node.parentId ? undefined : 10,
          }}
        >
          <div className="bg-gray-800">
            {childNodes?.map((node, index) => (
              <NodeTreeItem
                node={node}
                panelKeys={panelKeys}
                nodeIndex={index}
                onChangeKey={onChangeKey}
                key={node.id}
                allNodes={allNodes}
                selectedSubFlowId={selectedSubFlowId}
              />
            ))}
          </div>
        </Panel>
      ) : (
        <div
          className={`py-2 cursor-po inter flex flex-row justify-between text-left ant-menu-item border-gray-600 ${
            nodeIndex === 0 ? "" : "border-t"
          }`}
          style={{ paddingLeft: !node.parentId ? undefined : 26 }}
        >
          <div>{type}</div>
        </div>
      )}
    </Collapse>
  );
};
