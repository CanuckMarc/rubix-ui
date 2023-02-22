import { Layout, Tooltip, Switch } from "antd";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ChangeEvent, useEffect, useState } from "react";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";
import { NodeSpecJSON } from '../lib';
import { FlowSettings} from "./FlowSettingsModal";

const { Sider } = Layout;

type NodeProps = {
  nodes: NodeInterface[];
  gotoNode: (node: NodeInterface) => void;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  selectedSubFlowId?: string;
  openNodeMenu: (position: { x: number; y: number }, node: NodeInterface) => void;
  flowSettings: FlowSettings;
  hideNodeTree: boolean;
  setHideNodeTree: Function;
};

export const NodesTree = ({ nodes, nodesSpec, selectedSubFlowId, gotoNode, openNodeMenu, flowSettings, hideNodeTree, setHideNodeTree}: NodeProps) => {
  const [panelKeys, setPanelKeys] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const [nodesFiltered, setNodesFiltered] = useState<{ nodesL1: NodeInterface[]; remainingNodes: NodeInterface[] }>({
    nodesL1: [],
    remainingNodes: [],
  });

  const changeKeys = (key: string) => {
    const isExist = panelKeys.includes(key);
    setPanelKeys(isExist ? panelKeys.filter((item) => item !== key) : [...panelKeys, key]);
  };

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleNodeContextMenu = (event: { x: number; y: number }, node: NodeInterface) => {
    openNodeMenu({ x: event.x, y: event.y }, node);
  };

  const onChangeOpenPanels = (isExpanded: boolean) => () => {
    const ids = nodes.filter((n) => (isExpanded ? n.isParent : false)).map((n) => n.id);

    setIsExpandedAll(isExpanded);
    setPanelKeys(ids);
  };

  useEffect(() => {
    const key = search.toLowerCase().trim();
    const ids = {} as { [key: string]: string };

    const filtered =
      key.length > 0
        ? nodes.filter((node) => {
          const nodeType = `${node.type!!.split("/")[1]}${node.info?.nodeName ? ` (${node.info.nodeName})` : ""}`;
          return nodeType.toLowerCase().includes(key);
        })
        : nodes;

    const allNodes = [...filtered];

    const findParentNode = (id: string) => {
      ids[id] = id;
      const parentNode = nodes.find((e) => e.id === id);

      if (parentNode) {
        const isExisted = allNodes.some((n) => n.id === parentNode.id);
        if (!isExisted) {
          allNodes.push(parentNode);
        }

        if (parentNode.parentId) {
          findParentNode(parentNode.parentId);
        }
      }
    };

    filtered.forEach((item) => {
      if (item.parentId) {
        findParentNode(item.parentId);
      }
    });

    const nodeLevel1 = allNodes.filter((n) => !n.parentId);
    const remainingNodes = allNodes.filter((n) => !nodeLevel1.some((n2) => n2.id === n.id));
    setNodesFiltered({ nodesL1: nodeLevel1, remainingNodes });
    setPanelKeys(Object.keys(ids));
    setIsExpandedAll(true);
  }, [search, nodes]);

  useEffect(() => {
    setPanelKeys([...(window.subFlowIds || [])]);
  }, [selectedSubFlowId]);

  const onPanelSwitchChange = () => {
    if (!hideNodeTree) setHideNodeTree(true)
  }

  return (
    <div>
      <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
        <div className="p-2" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{fontSize: '14px'}}>Nodes Tree {flowSettings.showCount ? `(${nodes.length})` : ""}</span>
          <div>
            <span style={{fontSize: '12px', marginLeft: '10px'}}>hide:</span>
            <Switch 
              size={'small'}
              checked={hideNodeTree}
              style={{marginLeft: '2px'}}
              onChange={onPanelSwitchChange} 
            />
          </div>
          <Tooltip title={isExpandedAll ? "collapse all" : "expand all"}>
            {isExpandedAll ? (
              <CaretDownOutlined onClick={onChangeOpenPanels(false)} />
            ) : (
              <CaretRightOutlined onClick={onChangeOpenPanels(true)} />
            )}
          </Tooltip>
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
          {nodesFiltered.nodesL1.map((node, index) => (
            <NodeTreeItem
              key={node.id}
              node={node}
              nodesSpec={nodesSpec}
              gotoNode={gotoNode}
              nodeIndex={index}
              panelKeys={panelKeys}
              onChangeKey={changeKeys}
              allNodes={nodesFiltered.remainingNodes}
              selectedSubFlowId={selectedSubFlowId}
              handleNodeContextMenu={handleNodeContextMenu}
              flowSettings={flowSettings}
            />
          ))}
        </div>
      </Sider>
    </div>
  );
};
