import { Modal } from "antd";
import { FC, useState, useEffect } from "react";
import { JsonTable } from "react-json-to-html";
import { useParams } from "react-router-dom";
import { FlowFactory } from "../factory";
import { NodeInterface } from "../lib/Nodes/NodeInterface";

export type NodeHelpModalProps = {
  node: NodeInterface;
  open?: boolean;
  onClose: () => void;
};

export const NodeHelpModal: FC<NodeHelpModalProps> = ({ node, open = false, onClose }) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [value, setValue] = useState<object>({});

  const isRemote = !!connUUID && !!hostUUID;
  const factory = new FlowFactory();

  const handleClose = () => {
    setValue({});
    onClose();
  };

  const fetchNodeHelp = async () => {
    const type = node.type ? node.type.split("/")[1] : "";
    const res = (await factory.NodeHelpByName(connUUID, hostUUID, isRemote, type)) || {};
    setValue(res);
  };

  useEffect(() => {
    open && fetchNodeHelp();
  }, [node, open]);

  return (
    <Modal
      visible={open}
      onCancel={handleClose}
      title="Node Help"
      footer={null}
      className="node-help-modal text-black text-start"
    >
      <JsonTable json={value} />
    </Modal>
  );
};
