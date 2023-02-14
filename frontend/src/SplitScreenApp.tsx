import React, { useEffect, useState } from "react";
import SplitPane from "react-split-pane";

import TabSplitContent from "./TabSplitContent";

const SplitPanelKey = "SplitPanel";

const SplitScreenApp: React.FC = () => {
  const [showSplit, setShowSplit] = useState(false);

  const toggleSplit = () => {
    localStorage.setItem(SplitPanelKey, JSON.stringify(!showSplit));
    setShowSplit(!showSplit);
  };

  // useEffect(() => {
  //   setShowSplit(Boolean(JSON.parse(localStorage.getItem(SplitPanelKey) || "")));
  // }, []);

  return (
    // @ts-ignore
    <SplitPane split="vertical" size={showSplit ? "50%" : "100%"} allowResize style={{ overflowY: "auto" }}>
      <TabSplitContent showSplit={!showSplit} toggleSplit={toggleSplit} />
      {showSplit ? <TabSplitContent showSplit isRightPane toggleSplit={toggleSplit} /> : <div />}
    </SplitPane>
  );
};
export default SplitScreenApp;
