import React, { useEffect, useRef, useState } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Connection, Handle, Position, useReactFlow } from "react-flow-renderer/nocss";
import cx from "classnames";
import { colors, valueTypeColorMap } from "../util/colors";
import { isValidConnection } from "../util/isValidConnection";
import { AutoSizeInput } from "./AutoSizeInput";
import { InputSocketSpecJSON } from "../lib";
import { OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { isObjectEmpty } from "../../../utils/utils";

export type InputSocketProps = {
  connected?: boolean;
  value: any | undefined;
  minWidth?: number;
  subName?: string;
  dataInput?: any;
  dataOutput?: OutputNodeValueType;
  onChange: (key: string, value: any) => void;
  onSetWidthInput?: (width: number) => void;
  isHideConnect?: boolean;
  classnames?: string;
} & InputSocketSpecJSON;

export const REGEX_NUMBER = new RegExp("^$|^-?(\\d+)?(\\.?\\d*)?$");

const getValueOptions = (value: number) => {
  switch (value) {
    case 0:
      return false;
    case 1:
      return true;
    case -1:
      return null;
    default:
      return true;
  }
};

const getNumberOptions = (value: boolean | string | null) => {
  switch (value) {
    case false:
      return 0;
    case true:
      return 1;
    case null:
    case "null":
      return -1;
    default:
      return 1;
  }
};

const handleConvertInputNumber = (_value: any) => {
  if (_value === null) return "null";
  else if (!_value && _value !== 0) return "";
  return _value.toString();
};

export const InputSocket = ({
  connected,
  value,
  onChange,
  name,
  subName,
  valueType,
  minWidth,
  onSetWidthInput,
  dataInput,
  dataOutput,
  isHideConnect,
  classnames,
}: InputSocketProps) => {
  const instance = useReactFlow();
  const [inputNumber, setInputNumber] = useState(handleConvertInputNumber(value));
  const refName = useRef<HTMLDivElement>(null);

  const showFlowIcon = valueType === "flow";
  const colorName = valueTypeColorMap[valueType || "number"];
  const [backgroundColor, borderColor] = colors[colorName];

  const handleChangeInput = (value: string) => onChange(name, value);

  const onChangeInputNumber = (value: string) => {
    if (value.match(REGEX_NUMBER)) onChange(name, Number(value));
    setInputNumber(value);
  };

  const onBlurInputNumber = (e: React.FormEvent<HTMLInputElement>) => {
    if (inputNumber.match(REGEX_NUMBER)) {
      onChange(name, Number(inputNumber));
    } else if (inputNumber === "null") {
      onChange(name, null);
    } else {
      setInputNumber("0");
      onChange(name, 0);
    }
  };

  const onChangeInputBoolean = (e: React.FormEvent<HTMLSelectElement>) => {
    const value = getValueOptions(Number((e.target as HTMLInputElement).value));
    onChange(name, value);
  };

  const getDataByConnected = (valueCurrent: any /* number | string | boolean | null */) => {
    if (!connected) return `${valueCurrent}`;
    if (!dataInput) return valueType === "boolean" ? 1 : "";

    if (connected && dataOutput && !isObjectEmpty(dataOutput)) {
      let valueOutput = dataOutput.value;
      if (dataOutput.dataType === "boolean" && valueOutput !== null) {
        valueOutput = getNumberOptions(valueOutput);
      } else if (dataOutput.dataType === "string" && valueOutput === null) {
        valueOutput = "";
      }
      return valueOutput !== undefined ? `${valueOutput}` : "";
    }

    const input = dataInput.find((item: { pin: string }) => item.pin === name);
    if (!input) return valueType === "boolean" ? 1 : "";

    if (valueType === "boolean") {
      return getNumberOptions(input.value);
    } else if (valueType === "number") {
      return input.value === null || input.value === undefined ? "null" : `${input.value}`;
    }

    return input.value;
  };

  const findBooleanValueInput = () => {
    let value: any = "";
    if (connected && dataOutput) {
      value =
        typeof dataOutput.value === "number"
          ? getValueOptions(dataOutput.value)
          : getValueOptions(getNumberOptions(dataOutput.value));
    } else if (dataInput && dataInput.length > 0) {
      const input = dataInput.find((item: { pin: string }) => item.pin === name);
      value = input && input.value;
    }
    if (value === null) value = "null";
    else if (value === false) value = "false";
    return value || "";
  };

  useEffect(() => {
    if (refName.current) {
      const _width = refName.current.offsetWidth;
      onSetWidthInput && onSetWidthInput(_width + 1);
    }
  }, [refName]);

  return (
    <div className="flex grow items-center justify-start h-7">
      {showFlowIcon && <CaretRightOutlined style={{ color: "#ffffff", fontSize: "large" }} />}
      {showFlowIcon === false && (
        <div className="flex items-center w-full gap-4">
          <div
            ref={refName}
            style={{
              minWidth: minWidth === -1 ? "max-content" : minWidth,
            }}
          >
            {subName || name}
          </div>
          <div className="flex-1">
            {valueType === "string" && (
              <AutoSizeInput
                type="text"
                className={cx(classnames ? classnames : "bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag")}
                value={getDataByConnected(value || "")}
                onChangeInput={handleChangeInput}
              />
            )}
            {valueType === "number" && (
              <AutoSizeInput
                type="text"
                className={cx(classnames ? classnames : "bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag")}
                value={getDataByConnected(inputNumber)}
                onChangeInput={onChangeInputNumber}
                onBlur={onBlurInputNumber}
              />
            )}
            {valueType === "boolean" &&
              (connected ? (
                <AutoSizeInput
                  type="text"
                  className={cx(classnames ? classnames : "bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag")}
                  value={findBooleanValueInput()}
                  disabled
                />
              ) : (
                <select
                  value={getDataByConnected(getNumberOptions(value))}
                  className={cx(classnames ? classnames : "bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag")}
                  onChange={onChangeInputBoolean}
                  style={{ paddingRight: 18 }}
                >
                  <option value="1">true</option>
                  <option value="0">false</option>
                  <option value="-1">null</option>
                </select>
              ))}
          </div>
        </div>
      )}
      {!isHideConnect && (
        <Handle
          id={name}
          type="target"
          position={Position.Left}
          className={cx(borderColor, connected ? backgroundColor : "bg-gray-1100")}
          isValidConnection={(connection: Connection) => isValidConnection(connection, instance)}
        />
      )}
    </div>
  );
};
