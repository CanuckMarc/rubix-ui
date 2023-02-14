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

const defaultKey = "0";

export enum MAIN_TABS {
  PrimaryTab = "PrimaryTab",
  SecondaryTab = "SecondaryTab",
}

const RightPaneDefault = [
  {
    key: defaultKey,
    tabId: "tab0",
    label: "Tab 0",
    closable: true,
    children: (
      <HashRouter>
        <App parentTab={MAIN_TABS.SecondaryTab} childTab="tab0" />
      </HashRouter>
    ),
  },
];

export function TabSplitContent({
  showSplit = false,
  isRightPane = false,
  toggleSplit = () => {},
}: TabSplitContentProps): React.ReactElement {
  const parentTab = isRightPane ? MAIN_TABS.SecondaryTab : MAIN_TABS.PrimaryTab;
  const [activeKey, setActiveKey] = useState(defaultKey);
  const [items, setItems] = useState<TabsBuilder[]>(isRightPane ? RightPaneDefault : []);
  const newTabIndex = useRef(1);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const add = () => {
    const nextTab = newTabIndex.current++;
    const tabId = `${parentTab}-${nextTab}`;
    const newPanes = [...items];
    const label = `Tab ${nextTab}`;
    newPanes.push({
      key: tabId,
      tabId: tabId,
      label: label,
      closable: true,
      children: (
        <HashRouter>
          <App parentTab={parentTab} childTab={tabId} />
        </HashRouter>
      ),
    });
    saveToLocalStorage(newPanes);
    setItems(newPanes);
    setActiveKey(tabId);
  };

  const saveToLocalStorage = (panItems: TabsBuilder[]) => {
    const items = panItems.map(({ children, ...item }) => item);
    localStorage.setItem(parentTab, JSON.stringify(items));
  };

  const getItemsWithChildren = (items: TabsBuilder[]) =>
    items.map((item: TabsBuilder) => ({
      ...item,
      children: (
        <HashRouter>
          <App parentTab={parentTab} childTab={item.tabId} />
        </HashRouter>
      ),
    }));

  const remove = (targetKey: TargetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;

    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const nodeIdsDeleted = window.allFlow.nodes.filter((node) => node.childTab === targetKey).map((node) => node.id);
    window.allFlow.nodes = window.allFlow.nodes.filter((node) => !nodeIdsDeleted.includes(node.id));
    window.allFlow.edges = window.allFlow.edges.filter(
      (edge) => !nodeIdsDeleted.includes(edge.target) && !nodeIdsDeleted.includes(edge.source)
    );

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
    if (newPanes.length == 0) {
      if (isRightPane) {
        toggleSplit();
      } else {
        setActiveKey(defaultKey);
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

  // useEffect(() => {
  //   const savePanel = localStorage.getItem(parentTab);
  //   const items = savePanel === null ? [] : JSON.parse(savePanel!!);

  //   if (isRightPane) {
  //     if (items.length > 0) {
  //       setItems(getItemsWithChildren(items));
  //     }
  //   } else {
  //     setItems(getItemsWithChildren(items));
  //   }

  //   return () => {
  //     localStorage.removeItem(parentTab);
  //   };
  // }, []);

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
        <TabPane tab={homeIcon} key={defaultKey} closable={false}>
          <HashRouter>
            <App parentTab={parentTab} childTab={defaultKey} />
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
