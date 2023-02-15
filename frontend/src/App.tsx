import { Layout } from "antd";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import cx from "classnames";
import create from "zustand";
import { node } from "../wailsjs/go/models";

import { EventsOff, EventsOn } from "../wailsjs/runtime";
import AppRoutes from "./AppRoutes";
import { MenuSidebar } from "./components/sidebar/sidebar";
import { ThemeProvider } from "./themes/theme-provider";
import { openNotificationWithIcon } from "./utils/utils";
import { BacnetTableDataType } from "./components/wires-map/map"
import "./App.css";

const { Content } = Layout;

const OK_EVENT = "ok";
const WARN_EVENT = "warn";
const ERR_EVENT = "err";

export interface PointTableType {
  key: string;
  name: string;
  device_name: string;
  network_name: string;
  plugin_name: string;
  point_name: string;
  uuid: string;
}

export interface PointTableTypeRecord {
  id: string;
  existingFlowNet: node.Schema | undefined;
  pointOne: PointTableType;
  pointTwo: PointTableType;
}

export const useStore = create((set: any) => ({
  wiresMapNodes: [] as PointTableTypeRecord[],
  setWiresMapNodes: (pointArray: PointTableTypeRecord[]) => set(() => ({ wiresMapNodes: pointArray })),
}));

export const useBacnetStore = create((set: any) => ({
  bacnetNodes: [] as BacnetTableDataType[],
  setBacnetNodes: (nodesArray: BacnetTableDataType[]) => set(() => ({ bacnetNodes: nodesArray})),
}));

export const useIsLoading = create((set: any) => ({
  refreshCounter: 0 as Number,
  reset: () => set(() => ({ refreshCounter: 0 })),
  incrementRefreshCounter: () => set((state: any) => ({ refreshCounter: state.refreshCounter + 1 })),
}));

const getParentKey = (key: React.Key, tree: any): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item: any) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

type AppContainerProps = {
  isFlowRoute: boolean;
  children: React.ReactNode;
};

const AppContainer = ({ isFlowRoute, children }: AppContainerProps) => {
  return (
    <Layout>
      <MenuSidebar />
      <Layout className={cx("app-layout", { "flow-layout": isFlowRoute })}>
        <Content
          className={cx("app-layout-content", {
            "flow-layout-content": isFlowRoute,
          })}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export type AppTabContent = { windowTab: string; tabId: string };

const App: React.FC<AppTabContent> = ({ windowTab, tabId }) => {
  const { pathname } = useLocation();
  const [isRegistered, updateIsRegistered] = useState(false);
  const [isFlowRoute, setIsFlowRoute] = useState(false);

  useEffect(() => {
    registerNotification();

    return () => {
      EventsOff(OK_EVENT);
      EventsOff(ERR_EVENT);
    };
  }, []);

  const registerNotification = () => {
    if (isRegistered) {
      return;
    }

    updateIsRegistered(true);
    EventsOn(OK_EVENT, (val) => {
      openNotificationWithIcon("success", val);
    });

    EventsOn(WARN_EVENT, (val) => {
      openNotificationWithIcon("warning", val);
    });

    EventsOn(ERR_EVENT, (val) => {
      openNotificationWithIcon("error", val);
    });
  };

  useEffect(() => {
    setIsFlowRoute(pathname.startsWith("/rubix-flow"));
  }, [pathname]);

  return (
    <ThemeProvider>
      <AppContainer isFlowRoute={isFlowRoute}>
        <AppRoutes windowTab={windowTab} tabId={tabId} />
      </AppContainer>
    </ThemeProvider>
  );
};
export default App;
