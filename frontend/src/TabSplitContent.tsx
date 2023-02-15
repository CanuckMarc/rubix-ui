import { HashRouter } from "react-router-dom";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { SplitCellsOutlined, HomeFilled } from "@ant-design/icons";
import { Button, Tabs, Tooltip } from "antd";

import "./App.css";
import App from "./App";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
const { TabPane } = Tabs;

export interface TabsBuilder {
  key: string;
  label: string;
  children: ReactNode;
  closable: boolean;
  tabId: string;
}

export interface TabSplitContentProps {
  showSplit?: boolean;
  isRightPane?: boolean;
  toggleSplit?: VoidFunction;
}

const MainTabKeyDefault = "PrimaryTab-0";
const SecondTabKeyDefault = "SecondaryTab-0";

export enum MAIN_TABS {
  PrimaryTab = "PrimaryTab",
  SecondaryTab = "SecondaryTab",
}

export const NODES_IN_TAB = "nodes_by_tab";

const RightPaneDefault = [
  {
    key: SecondTabKeyDefault,
    tabId: SecondTabKeyDefault,
    label: "Tab 0",
    closable: true,
    children: (
      <HashRouter>
        <App windowTab={MAIN_TABS.SecondaryTab} tabId={SecondTabKeyDefault} />
      </HashRouter>
    ),
  },
];

export function TabSplitContent({
  showSplit = false,
  isRightPane = false,
  toggleSplit = () => {},
}: TabSplitContentProps): React.ReactElement {
  const windowTab = isRightPane ? MAIN_TABS.SecondaryTab : MAIN_TABS.PrimaryTab;
  const [activeKey, setActiveKey] = useState(isRightPane ? SecondTabKeyDefault : MainTabKeyDefault);
  const [items, setItems] = useState<TabsBuilder[]>(isRightPane ? RightPaneDefault : []);
  const newTabIndex = useRef(1);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const saveNewTabIntoLocalStorage = (tabId: string, isDelete = false) => {
    const tabState = localStorage.getItem(NODES_IN_TAB);
    const newTabState = tabState === null ? {} : JSON.parse(tabState);
    if (isDelete) {
      delete newTabState[tabId];
    } else {
      newTabState[tabId] = [];
    }
    localStorage.setItem(NODES_IN_TAB, JSON.stringify({ ...newTabState }));
  };

  const add = () => {
    const nextTab = newTabIndex.current++;
    const tabId = `${windowTab}-${nextTab}`;
    const newPanes = [...items];
    const label = `Tab ${nextTab}`;
    newPanes.push({
      key: tabId,
      tabId: tabId,
      label: label,
      closable: true,
      children: (
        <HashRouter>
          <App windowTab={windowTab} tabId={tabId} />
        </HashRouter>
      ),
    });
    saveToLocalStorage(newPanes);
    saveNewTabIntoLocalStorage(tabId);
    setItems(newPanes);
    setActiveKey(tabId);
  };

  const saveToLocalStorage = (panItems: TabsBuilder[]) => {
    const items = panItems.map(({ children, ...item }) => item);
    localStorage.setItem(windowTab, JSON.stringify(items));
  };

  const getItemsWithChildren = (items: TabsBuilder[]) =>
    items.map((item: TabsBuilder) => ({
      ...item,
      children: (
        <HashRouter>
          <App windowTab={windowTab} tabId={item.tabId} />
        </HashRouter>
      ),
    }));

  const removeNodesInTab = (tabId: string) => {
    if (!window.allFlow) {
      window.allFlow = { nodes: [], edges: [] };
    }
    const tabState = localStorage.getItem(NODES_IN_TAB);
    const newTabState = tabState === null ? {} : JSON.parse(tabState);
    const nodeIds = newTabState[tabId] || [];

    window.allFlow.nodes = window.allFlow.nodes.filter((node) => !nodeIds.includes(node.id));
    window.allFlow.edges = window.allFlow.edges.filter(
      (edge) => !nodeIds.includes(edge.target) && !nodeIds.includes(edge.source)
    );
  };

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;

    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = items.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setItems(newPanes);
    saveToLocalStorage(newPanes);
    saveNewTabIntoLocalStorage(targetKey as string, true);
    removeNodesInTab(targetKey as string);
    if (newPanes.length == 0) {
      if (isRightPane) {
        toggleSplit();
      } else {
        setActiveKey(MainTabKeyDefault);
      }
    } else {
      setActiveKey(newActiveKey);
    }
  };

  const onEdit = (targetKey: TargetKey, action: "add" | "remove") => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };

  useEffect(() => {
    const savePanel = localStorage.getItem(windowTab);
    const items = savePanel === null ? [] : JSON.parse(savePanel!!);

    if (isRightPane) {
      if (items.length > 0) {
        setItems(getItemsWithChildren(items));
      }
    } else {
      setItems(getItemsWithChildren(items));
    }

    return () => {
      localStorage.removeItem(windowTab);
    };
  }, []);

  const togglePaneBtn = (
    <Tooltip placement="topLeft" title={"Split Editor Right"}>
      <Button icon={<SplitCellsOutlined />} onClick={toggleSplit} />
    </Tooltip>
  );

  const homeIcon = (
    <span>
      <HomeFilled />
      Main
    </span>
  );

  return (
    <Tabs
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      tabBarStyle={{ margin: 0 }}
      tabBarExtraContent={showSplit && togglePaneBtn}
    >
      {!isRightPane && (
        <TabPane tab={homeIcon} key={MainTabKeyDefault} closable={false}>
          <HashRouter>
            <App windowTab={windowTab} tabId={MainTabKeyDefault} />
          </HashRouter>
        </TabPane>
      )}
      {items.map((tab: TabsBuilder) => (
        <TabPane tab={tab.label} key={tab.key} closable={tab.closable}>
          {tab.children}
        </TabPane>
      ))}
    </Tabs>
  );
}
export default TabSplitContent;
