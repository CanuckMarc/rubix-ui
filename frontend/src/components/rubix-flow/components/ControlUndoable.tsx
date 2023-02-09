import clsx from "clsx";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons";
import { useCallback } from "react";

export type ControlUndoableProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const ControlUndoable = ({ canUndo, canRedo, onUndo, onRedo }: ControlUndoableProps) => {
  const renderIconBtn = useCallback(
    (title: string, ableClick: boolean, onClick: () => void, Icon: any) => {
      return (
        <div
          className={clsx("border-r hover:bg-gray-200", {
            "cursor-pointer": ableClick,
            "bg-gray-200": ableClick,
            "bg-white": !ableClick,
          })}
          title={title}
          onClick={ableClick ? onClick : undefined}
        >
          <Icon className="p-2 text-gray-700 align-middle" />
        </div>
      );
    },
    [canUndo, canRedo]
  );

  return (
    <div className="absolute top-4 left-4 bg-white z-10 flex black--text">
      {renderIconBtn("Undo", canUndo, onUndo, UndoOutlined)}
      {renderIconBtn("Redo", canRedo, onRedo, RedoOutlined)}
    </div>
  );
};

export default ControlUndoable;
