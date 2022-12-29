import { FC } from "react";
import { Modal } from "./Modal";

export type ErrorModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const ModalError: FC<ErrorModalProps> = ({ open = false, onClose }) => {
  return (
    <Modal
      title="Warning"
      actions={[{ label: "Close", onClick: onClose }]}
      open={open}
      onClose={onClose}
    >
     <div className="p-3 border-b">
          <h2 className="text-3xl text-center title black--text">
            Can't download
          </h2>
        </div>
    </Modal>
  );
};
