import { useState } from "react";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeHelpModal } from "./NodeHelpModal";

type Props = {
  node: NodeInterface;
  onClose: () => void;
};

export const HelpComponent = ({ node, onClose }: Props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    onClose();
  };

  return (
    <>
      <div key="help" className="cursor-pointer ant-menu-item" onClick={openModal}>
        Help
      </div>
      <NodeHelpModal node={node} open={isModalVisible} onClose={closeModal} />
    </>
  );
};
