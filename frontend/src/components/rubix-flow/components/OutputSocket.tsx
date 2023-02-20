import { memo, useCallback, useEffect, useRef, useState } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Connection, Handle, Position, useReactFlow } from "reactflow";
import cx from "classnames";
import { colors, valueTypeColorMap } from "../util/colors";
import { isValidConnection } from "../util/isValidConnection";
import { OutputSocketSpecJSON } from "../lib";
import { AutoSizeInput } from "./AutoSizeInput";

export type OutputSocketProps = {
  connected: boolean;
  minWidth: number;
  subName?: string;
  dataOut: Array<any>;
  onSetWidthInput: (width: number) => void;
} & OutputSocketSpecJSON;

export const OutputSocket = memo(
  ({ connected, valueType, name, subName, minWidth, dataOut, onSetWidthInput }: OutputSocketProps) => {
    const instance = useReactFlow();
    const refName = useRef<HTMLDivElement>(null);
    const [outValue, setOutValue] = useState<string | number>("");

    const showFlowIcon = valueType === "flow";
    const colorName = valueTypeColorMap[valueType || "number"];
    const [backgroundColor, borderColor] = colors[colorName];

    const getValueOutput = useCallback(
      (outputName: string) => {
        if (dataOut) {
          const out = dataOut.find((item: { pin: string }) => item.pin === outputName);

          if (valueType === "number" && out) {
            if (out.value === null) out.value = "null";
            return out.value !== undefined ? `${out.value}` : "";
          }
          return out?.value;
        }
        return "";
      },
      [valueType, dataOut, name]
    );

    const getValueOptions = (value: boolean | null) => {
      const newVal = value === null ? null : Boolean(value);

      switch (newVal) {
        case true:
        case false:
          return `${newVal}`;
        case null:
          return "null";
        default:
          return "false";
      }
    };

    useEffect(() => {
      const val = valueType === "boolean" ? getValueOptions(getValueOutput(name)) : getValueOutput(name);

      if (val !== outValue) {
        setOutValue(val);
      }
    }, [valueType, name, dataOut]);

    useEffect(() => {
      if (refName.current) {
        const _width = refName.current.offsetWidth;
        onSetWidthInput(_width);
      }
    }, [refName]);

    return (
      <div className="flex grow items-center justify-end h-7">
        <div style={{ display: "flex" }}>
          <AutoSizeInput
            type="text"
            className="bg-gray-600 disabled:bg-gray-700 py-1 px-2 mr-2 nodrag"
            value={outValue || ""}
            minWidth={40}
            disabled
          />
          {showFlowIcon ? (
            <CaretRightOutlined style={{ color: "#ffffff", fontSize: "large" }} />
          ) : (
            <div
              ref={refName}
              className="flex justify-end"
              style={{ minWidth: minWidth === -1 ? "max-content" : minWidth }}
            >
              {subName || name}
            </div>
          )}
          <Handle
            id={name}
            type="source"
            position={Position.Right}
            className={cx(borderColor, connected ? backgroundColor : "bg-gray-1100")}
            isValidConnection={(connection: Connection) => isValidConnection(connection, instance)}
          />
        </div>
      </div>
    );
  }
);
