import { useRef } from "react";
import { XYPosition } from "react-flow-renderer/nocss";
import { useOnPressKey } from "../hooks/useOnPressKey";
import { NodeSpecJSON } from "../lib";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

type MenuProps = {
  position: XYPosition | undefined;
  node: NodeInterface[];
  onClose: () => void;
  selectedNodeForSubFlow?: NodeInterface;
  handleAlignLefts: (position: { x: number; y: number }) => void;
  handleAlignRights: (position: { x: number; y: number }, width: number) => void;
  isOpenFromNodeTree: boolean;
};

export const DEFAULT_NODE_SPEC_JSON: NodeSpecJSON = {
  allowSettings: false,
  type: "",
  category: "None",
};

const SelectMenu = ({
  position,
  node,
  onClose,
  handleAlignLefts,
  handleAlignRights,
  isOpenFromNodeTree = false,
}: MenuProps) => {
  const ref = useRef(null);

  useOnPressKey("Escape", onClose);

  const handleAlignLeft = () => {
    handleAlignLefts(node[0].position);
    onClose();
  };
  const handleAlignRight = () => {
    handleAlignRights(node[0].position, node[0].width!!);
    onClose();
  };
  return (
    <>
      {(
        <div
          ref={ref}
          className={`node-picker node-menu ${
            isOpenFromNodeTree ? "fixed" : "absolute"
          } z-10 text-white border rounded border-gray-500 ant-menu ant-menu-root ant-menu-inline ant-menu-dark`}
          style={{
            top: position?.y,
            left: position?.x,
            width: "auto",
            borderRight: "1px solid #303030",
            minWidth: 120,
          }}
        >
          <div
            key="Align left"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleAlignLeft}
          >
            Align left
          </div>
          <div
            key="Align right"
            className="cursor-pointer border-b border-gray-600 ant-menu-item"
            onClick={handleAlignRight}
          >
            Align right
          </div>
        </div>
      )}
    </>
  );
};
export default SelectMenu;
