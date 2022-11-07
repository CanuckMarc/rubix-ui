import { PropsWithChildren } from "react";
import cx from "classnames";
import { categoryColorMap, colors } from "../util/colors";
import { NodeSpecJSON } from "../lib";

type NodeProps = {
  title: string;
  icon: string;
  category?: NodeSpecJSON["category"];
  selected: boolean;
  height: number;
  hasChild: boolean;
  onDbClickTitle: () => void;
};

export const NodeContainer = ({
  title,
  icon,
  category = "None",
  selected,
  children,
  height,
  hasChild,
  onDbClickTitle,
}: PropsWithChildren<NodeProps>) => {
  const colorName = categoryColorMap[category] || "gray";
  let [backgroundColor, borderColor, textColor] = colors[colorName];
  if (selected) {
    borderColor = "border-gray-800";
  }

  return (
    <div
      className={cx([
        `rounded text-white bg-gray-800 min-w-[130px] text-start`,
        { "bg-opacity-50": hasChild, "outline outline-1": selected },
      ])}
    >
      <div
        className={`flex ${backgroundColor} ${textColor} px-3 py-1 rounded-t`}
        onDoubleClick={onDbClickTitle}
      >
        {icon && <div className="pr-3">{icon}</div>}
        <div>
          {title}
          <div>{category}</div>
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 py-3 border-l border-r border-b ${borderColor}`}
        style={{ minHeight: height ? height - 50 : "auto" }}
      >
        {children}
      </div>
    </div>
  );
};
