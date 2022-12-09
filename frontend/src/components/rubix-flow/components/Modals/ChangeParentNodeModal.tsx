import { FC } from "react";
import { Modal } from "../Modal";

export type ChangeParentNodeModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const ChangeParentNodeModal: FC<ChangeParentNodeModalProps> = ({
  open = false,
  onClose,
}) => {
  return (
    <Modal
      actions={[{ label: "Cancel", onClick: onClose }]}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-8 relative my-3 px-5 py-3 bg-white">
        <p className="text-2xl font-semibold mb-0 text-red-600">
          <span>Error: </span>
          <span className="">Max one parent node can be selected.</span>
        </p>
      </div>
    </Modal>
  );
};
