import { HashRouter } from "react-router-dom";
import React, { ReactNode, useRef, useState } from 'react';
import {
  SplitCellsOutlined,
  HomeFilled
} from '@ant-design/icons';

import "./App.css";
import App from "./App";
import { Button, Checkbox, Tabs, TabsProps, Tooltip } from "antd";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
const { TabPane } = Tabs;


export interface TabsBuilder {
  key: string,
  label: string,
  children: ReactNode,
  closable: boolean,
}

export interface TabSplitContentProps {
  showSplit?: boolean,
  isRightPane?: boolean,
  toggleSplit?: VoidFunction
}


const defaultKey = "0"
const child = <HashRouter>
  <App />
</HashRouter>;

export function TabSplitContent({
  showSplit = false,
  isRightPane = false,
  toggleSplit = () => { },
}: TabSplitContentProps): React.ReactElement {

  const [activeKey, setActiveKey] = useState("0");
  const [items, setItems] = useState(
    isRightPane ? [{
      key: defaultKey,
      label: "Tab 0",
      closable: true,
      children: child,
    }] : []);

  const newTabIndex = useRef(0);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };


  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    const newPanes = [...items];
    const label = `Tab ${newTabIndex.current}`;
    newPanes.push({
      key: newActiveKey,
      label: label,
      closable: true,
      children: child,
    });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  };

  const remove = (
    targetKey: TargetKey,
  ) => {
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

  const onEdit = (
    targetKey: TargetKey,
    action: 'add' | 'remove',
  ) => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  const togglePaneBtn =
    <Tooltip placement="topLeft" title={"Split Editor Right"}>
      <Button icon={<SplitCellsOutlined />} onClick={toggleSplit} />
    </Tooltip>;

  const homeIcon =
    <span>
      <HomeFilled />
      Main
    </span>;

  return <Tabs
    type="editable-card"
    onChange={onChange}
    activeKey={activeKey}
    onEdit={onEdit}
    tabBarStyle={{ margin: 0 }}
    tabBarExtraContent={showSplit && togglePaneBtn}
  >
    {!isRightPane && <TabPane tab={homeIcon} key={defaultKey} closable={false}>
      {child}
    </TabPane>}
    {items.map((tab: TabsBuilder) =>
      <TabPane tab={tab.label} key={tab.key} closable={tab.closable}>
        {tab.children}
      </TabPane>)
    }
  </Tabs>
};
export default TabSplitContent;
