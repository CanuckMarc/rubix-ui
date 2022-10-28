import { List } from "antd";
import { FC } from "react";
import { Modal } from "./Modal";

export type HelpModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const HelpModal: FC<HelpModalProps> = ({ open = false, onClose }) => {
  const noteList = [
    "NODES...",
    "Right click anywhere to add a new node.",
    "Left click to select nodes or connections.",
    "Press Delete key to remove selected nodes or connections.",
    "Click and drag on a socket to connect to another socket of the same type.",
    "Hold shift and drag for multi-selection.",
    "Drag a connection into empty space to add a new node and connect it to the source.",
    "SHORTCUTS...",
    "Hold Alt and Left click to select nodes or connections.",
    "Hold Control and A to select all node.",
    "Hold Control and E for export to nodes .",
    "Hold Control and I for import to nodes.",
    "Hold Control and C to copy nodes.",
    "Hold Control and D to duplicate nodes.",
    "Hold Control and Z to undo.",
    "Hold Control and Y to redo.",
    "Hold Control and S to save/deploy flow.",
    "Hold Control and X to refresh node values (you can hold down control-x and this will update as fast as possible)",
  ];

  return (
    <Modal
      title="Help"
      actions={[{ label: "Close", onClick: onClose }]}
      open={open}
      onClose={onClose}
    >
      <List
        size="small"
        dataSource={noteList}
        renderItem={(item) => (
          <List.Item
            className="black--text"
            style={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {item}
          </List.Item>
        )}
      />
    </Modal>
  );
};
