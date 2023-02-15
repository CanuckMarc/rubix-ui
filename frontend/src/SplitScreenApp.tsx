import React, { useEffect, useState } from "react";
import SplitPane from "react-split-pane";

import TabSplitContent, { NODES_IN_TAB } from "./TabSplitContent";

const SplitPanelKey = "SplitPanel";

const SplitScreenApp: React.FC = () => {
  const [showSplit, setShowSplit] = useState(false);

  const toggleSplit = () => {
    if (showSplit) {
      // remove nodes in the split panel
      const tabs = localStorage.getItem(NODES_IN_TAB);
      const tabsWithNodes = tabs === null ? [] : JSON.parse(tabs);
      const tabIds: string[] = Object.keys(tabsWithNodes);

      tabIds.forEach((id: string) => {
        if (id.includes("SecondaryTab")) {
          window.allFlow.nodes = window.allFlow.nodes.filter((n) => !tabsWithNodes[id]?.includes(n.id));
        }
      });
    }
    localStorage.setItem(SplitPanelKey, JSON.stringify(!showSplit));
    setShowSplit(!showSplit);
  };

  useEffect(() => {
    setShowSplit(Boolean(JSON.parse(localStorage.getItem(SplitPanelKey) || "")));
  }, []);

  return (
    // @ts-ignore
    <SplitPane split="vertical" size={showSplit ? "50%" : "100%"} allowResize style={{ overflowY: "auto" }}>
      <TabSplitContent showSplit={!showSplit} toggleSplit={toggleSplit} />
      {showSplit ? <TabSplitContent showSplit isRightPane toggleSplit={toggleSplit} /> : <div />}
    </SplitPane>
  );
};
export default SplitScreenApp;
