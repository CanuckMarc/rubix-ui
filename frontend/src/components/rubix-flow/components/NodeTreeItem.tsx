import { Collapse } from "antd";
import { NodeSpecJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { FlowSettings } from "./FlowSettingsModal";

const { Panel } = Collapse;

type NodeProps = {
  allNodes: NodeInterface[];
  node: NodeInterface;
  panelKeys: string[];
  nodeIndex: number;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  onChangeKey: (key: string) => void;
  gotoNode: (node: NodeInterface) => void;
  selectedSubFlowId?: string;
  handleNodeContextMenu: (position: { x: number; y: number }, node: NodeInterface) => void;
  flowSettings: FlowSettings;
};

export const NodeTreeItem = ({
  allNodes,
  node,
  panelKeys,
  nodeIndex,
  onChangeKey,
  nodesSpec,
  gotoNode,
  selectedSubFlowId,
  handleNodeContextMenu,
  flowSettings,
}: NodeProps) => {
  const childNodes = allNodes.filter((item) => item.parentId === node.id);
  const type = node.type!!.split("/")[1] + (node.info?.nodeName ? ` (${node.info?.nodeName})` : "");

  const doubleClick = (e: any) => {
    e.preventDefault();
    handleNodeContextMenu({ x: e.clientX, y: e.clientY }, node);
  };

  const onClickNode = (e: unknown) => {
    (e as MouseEvent).preventDefault();
    gotoNode(node);
  };

  const spec = Array.isArray(nodesSpec) ? nodesSpec.find((sp) => sp.type === node.type) : undefined;

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
          header={`${type} ${flowSettings.showCount ? " - " + childNodes.length : ""}`}
          className={`panel-no-padding border-gray-600 border-t border-b-0  relative ${
            node.id === selectedSubFlowId ? "tree-active" : ""
          }`}
          style={{
            paddingLeft: !node.parentId ? undefined : 10,
          }}
          extra={
            <div className="w-4/5 h-full absolute left-0 top-0" onClick={onClickNode} onContextMenu={doubleClick}>
              {!!spec?.info?.icon && <span className="pr-3 pt-1">{spec?.info?.icon}</span>}
            </div>
          }
        >
          <div className="bg-gray-800">
            {childNodes?.map((node, index) => (
              <NodeTreeItem
                node={node}
                panelKeys={panelKeys}
                nodeIndex={index}
                gotoNode={gotoNode}
                onChangeKey={onChangeKey}
                key={node.id}
                allNodes={allNodes}
                selectedSubFlowId={selectedSubFlowId}
                nodesSpec={nodesSpec}
                handleNodeContextMenu={handleNodeContextMenu}
                flowSettings={flowSettings}
              />
            ))}
          </div>
        </Panel>
      ) : (
        <div
          onClick={onClickNode}
          onContextMenu={doubleClick}
          className={`py-2 cursor-po inter flex flex-row flex-start gap-2 items-center text-left ant-menu-item border-gray-600 ${
            nodeIndex === 0 ? "" : "border-t"
          }`}
          style={{ paddingLeft: !node.parentId ? undefined : 26 }}
        >
          {!!spec?.info?.icon && <span className="top-2 relative">{spec?.info?.icon}</span>}
          {type}
        </div>
      )}
    </Collapse>
  );
};
