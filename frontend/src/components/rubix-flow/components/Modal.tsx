import { FC, PropsWithChildren } from "react";
import { useOnPressKey } from "../hooks/useOnPressKey";

export type ModalAction = {
  label: string;
  onClick: () => void;
};

export type ModalProps = {
  open?: boolean;
  onClose: () => void;
  title?: string;
  actions: ModalAction[];
};

const actionColors = {
  primary: "bg-blue-400 hover:bg-blue-500",
  secondary: "bg-gray-400 hover:bg-gray-500",
};

export const Modal: FC<PropsWithChildren<ModalProps>> = ({
  open = false,
  onClose,
  title,
  children,
  actions,
}) => {
  useOnPressKey("Escape", onClose);

  if (open === false) return null;

  return (
    <>
      <div
        className="z-[19] fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        onClick={onClose}
      />
      <div
        className="z-20 relative top-20 mx-auto border shadow-lg bg-white rounded-md"
        style={{ minWidth: "400px", width: "fit-content" }}
      >
        {title && (
          <div className="p-3 border-b">
            <h2 className="text-3xl text-center font-bold title black--text">
              {title}
            </h2>
          </div>
        )}
        <div
          className="p-3 text-start black--text"
          style={{
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
        <div className="flex gap-3 p-3 border-t">
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={
                "text-white p-2 w-full cursor-pointer " +
                (ix === actions.length - 1
                  ? actionColors.primary
                  : actionColors.secondary)
              }
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
