
import React, { useState, useEffect } from "react";
import SplitPane from "react-split-pane";

import TabSplitContent from "./TabSplitContent";


const SplitScreenApp: React.FC = () => {
  const [showSplit, setShowSplit] = useState(false);

  const toggleSplit = () => {
    setShowSplit(!showSplit);
  }

  return (
    // @ts-ignore
    <SplitPane
      split="vertical"
      size={showSplit ? "50%" : "100%"}
      allowResize
      style={{ overflowY: 'auto' }}
    >
      <TabSplitContent showSplit={!showSplit} toggleSplit={toggleSplit} />
      {showSplit ? <TabSplitContent showSplit isRightPane toggleSplit={toggleSplit} /> : <div></div>}
    </SplitPane>
  );
};
export default SplitScreenApp;
