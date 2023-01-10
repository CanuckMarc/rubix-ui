import { Collapse, Layout} from "antd";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

const { Panel } = Collapse;
const { Sider } = Layout;
type NodeProps = {
    allNodes: NodeInterface[];
    childNodes: NodeInterface[];
}   

export const RenderNodes = ({allNodes,childNodes} : NodeProps) => {
  return (
    <Collapse expandIconPosition="right" className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0">
      {childNodes?.map((node, index) => {
        const nodesChild: NodeInterface[] = allNodes.filter((item: NodeInterface) => item.parentId === node.id);
        return node.isParent ? (
          <Panel key={index} header={node.type && node.type.split("/")[1]} className="panel-no-padding border-gray-600" style={index === 0 ? {} : { paddingLeft: 24 }}>
            <div className="bg-gray-800"><RenderNodes childNodes={nodesChild} allNodes={allNodes}/></div>
          </Panel>
        ) : (
          <div
            key={index}
            className={`py-2 cursor-po inter flex flex-row justify-between
                             text-left ant-menu-item border-gray-600
                              ${index === 0 ? "" : "border-t"}`}
            draggable
          >
            <div>{node.type && node.type.split("/")[1]}</div>
          </div>
        );
      })}
    </Collapse>
  );
};
