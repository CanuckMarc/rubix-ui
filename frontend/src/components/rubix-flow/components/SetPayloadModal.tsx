import { FC, useState } from "react";
import { useParams } from "react-router-dom";

import { FlowFactory } from "../factory";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { Modal } from "./Modal";
import { InputSocket } from "./InputSocket";
import { InputSocketSpecJSON, NodeSpecJSON } from "../lib";

export type SetPayloadModalProps = {
  node: NodeInterface;
  nodeType: NodeSpecJSON;
  open?: boolean;
  onClose: () => void;
};

export const SetPayloadModal: FC<SetPayloadModalProps> = ({ node, nodeType, open = false, onClose }) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [payload, setPayload] = useState<any>(null);

  const isRemote = !!connUUID && !!hostUUID;
  const factory = new FlowFactory();

  const handleChange = (key: string, value: any) => {
    setPayload(value);
  };

  const handleSave = async () => {
    await factory.NodePayload(connUUID, hostUUID, isRemote, { payload: payload }, node.id);
    setPayload(null);
    onClose();
  };

  return (
    <Modal
      title="Set Payload"
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Set", onClick: handleSave },
      ]}
      open={open}
      onClose={onClose}
    >
      {nodeType && (
        <div className="flex flex-row justify-between gap-8 relative my-3 px-4 py-3 bg-white">
          <InputSocket
            classnames="border border-gray-300 px-2 py-1 align-top w-full"
            name={"Value"}
            valueType={nodeType.payloadType || "string"}
            value={payload}
            onChange={handleChange}
            isHideConnect
          />
        </div>
      )}
    </Modal>
  );
};
