import { FC, useEffect, useState } from "react";
import { useReactFlow } from "react-flow-renderer/nocss";

import { NodeInterface } from "../../lib/Nodes/NodeInterface";
import { InputSocket } from "../InputSocket";
import { Modal } from "../Modal";

export type SetNameModalProps = {
  node: NodeInterface;
  open?: boolean;
  onClose: () => void;
};

export const SetNameModal: FC<SetNameModalProps> = ({
  node,
  open = false,
  onClose,
}) => {
  const [name, setName] = useState<string>("");
  const instance = useReactFlow();

  const handleChange = (key: string, value: any) => {
    setName(value);
  };

  const handleSubmit = () => {
    const newNodes = instance.getNodes().map((item: NodeInterface) => {
      if (item.id === node.id) {
        return {
          ...item,
          info: { nodeName: name },
        };
      }

      return item;
    });
    instance.setNodes(newNodes);

    setName("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    setName(node.info?.nodeName || "");
  }, [node, open]);

  return (
    <Modal
      title="Set Name"
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Set", onClick: handleSubmit },
      ]}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-row justify-between gap-8 relative my-3 px-4 py-3 bg-white">
        <InputSocket
          classnames="border border-gray-300 px-2 py-1 align-top w-full"
          name={"Name"}
          valueType="string"
          value={name}
          autoFocus
          onChange={handleChange}
          isHideConnect
        />
      </div>
    </Modal>
  );
};
