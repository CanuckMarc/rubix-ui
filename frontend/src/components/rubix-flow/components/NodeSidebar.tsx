import { Collapse, Layout, Modal, Tooltip } from "antd";
import { CaretRightOutlined, CaretDownOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useState, ChangeEvent, useEffect, memo } from "react";
import { NodeSpecJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeHelpModal } from "./NodeHelpModal";
const { Panel } = Collapse;
const { Sider } = Layout;

type NodeSiderBarProps = {
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
};

export const NodeSideBar = memo(({ nodesSpec }: NodeSiderBarProps) => {
  const [search, setSearch] = useState("");
  const [nodes, setNodes] = useState<{ [key: string]: NodeSpecJSON[] }>({});
  const [activeKeyPanel, setActiveKeyPanel] = useState<string[]>([]);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState("");

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onChangeOpenPanels = (key: string | string[]) => {
    setActiveKeyPanel(typeof key === "string" ? [key] : key);
  };

  const onClickHelpIcon = (event: React.MouseEvent, nodeType: string) => {
    event.stopPropagation();
    setIsShowHelpModal((p) => !p);
    setSelectedNodeType(nodeType);
  };

  const onDragStart = (event: any, isParent: any, nodeType: string) => {
    const data = { isParent, nodeType };
    event.dataTransfer.setData("from-node-sidebar", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };

  useEffect(() => {
    const key = search.toLowerCase().trim();
    const items = nodesSpec as NodeSpecJSON[];
    const types = {} as { [key: string]: NodeSpecJSON[] };
    const filtered = key.length > 0 ? items.filter((node) => node.type.toLowerCase().includes(key)) : items;

    filtered.forEach((item) => {
      if (types[item.category]) {
        types[item.category].push(item);
      } else {
        types[item.category] = [item];
      }
    });

    setActiveKeyPanel(key.length > 0 ? Object.keys(types) : []);
    setNodes(types);
  }, [search, nodesSpec]);

  return (
    <div>
      <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
        <div className="p-2">
          Add Node
          {activeKeyPanel.length !== Object.keys(nodes).length ? (
            <Tooltip title="expand all">
              <CaretRightOutlined className="title-icon" onClick={() => onChangeOpenPanels(Object.keys(nodes))} />
            </Tooltip>
          ) : (
            <Tooltip title="collapse all">
              <CaretDownOutlined className="title-icon" onClick={() => onChangeOpenPanels([])} />
            </Tooltip>
          )}
        </div>
        <div className="p-2">
          <input
            type="text"
            autoFocus
            placeholder="Type to filter"
            className="bg-gray-600 disabled:bg-gray-700 w-full py-1 px-2"
            value={search}
            onChange={onChangeSearch}
          />
        </div>
        <div className="overflow-y-scroll" style={{ height: "calc(100vh - 110px)" }}>
          <Collapse
            activeKey={activeKeyPanel}
            expandIconPosition="right"
            onChange={onChangeOpenPanels}
            className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0"
          >
            {Object.keys(nodes).map((category) => (
              <Panel key={category} header={category} className="panel-no-padding border-gray-600">
                <div className="bg-gray-800">
                  {nodes[category].map(({ info, type, isParent }, index) => (
                    <div
                      key={`${type}-${index}`}
                      className={`py-2 cursor-po inter text-white flex flex-row justify-between
                    border-gray-600 text-left ant-menu-item
                    ${index === 0 ? "" : "border-t"}`}
                      onDragStart={(event) => onDragStart(event, isParent, type)}
                      draggable
                      style={{ paddingLeft: 24 }}
                    >
                      <div>
                        {info && info.icon && (
                          <span className="pr-3" style={{ fontSize: 12 }}>
                            {info.icon}
                          </span>
                        )}
                        {type.split("/")[1]}
                      </div>
                      <div>
                        <QuestionCircleOutlined onClick={(e) => onClickHelpIcon(e, type)} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>

        <NodeHelpModal
          node={{ type: selectedNodeType } as NodeInterface}
          open={isShowHelpModal}
          onClose={() => setIsShowHelpModal(false)}
        />
      </Sider>
    </div>
  );
});
