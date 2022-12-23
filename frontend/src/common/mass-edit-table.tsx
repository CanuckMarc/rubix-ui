import { Checkbox, Input, InputNumber, Select, Table } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useEffect } from "react";
import RbTable from "./rb-table";

interface Options {
  value: "number" | "string";
  label: "number" | "string";
}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "string" | "boolean" | "array";
  record: any;
  index: number;
  children: React.ReactNode;
  defaultValue: any;
  options: Options[];
}

export const createColumns = (properties: any) => {
  if (!properties) return;

  const columns: any[] = [];
  Object.keys(properties).forEach((key) => {
    if (key !== "uuid" && properties[key].type) {
      //handle select input
      const options = [];
      if (properties[key].enum) {
        for (let i = 0; i < properties[key].enum.length; i++) {
          options.push({
            value: properties[key].enum[i],
            label: properties[key].enumNames ? properties[key].enumNames[i] : properties[key].enum[i],
          });
        }
      }
      const column = {
        key: key,
        title: key.replaceAll("_", " "),
        dataIndex: key,
        type: properties[key].enum && properties[key].enum.length > 0 ? "array" : properties[key].type,
        editable: !properties[key].readOnly || false,
        defaultValue: properties[key].default || undefined,
        options: options,
      } as any;

      columns.push(column);
    }
  });
  return columns;
};

export const MassEditTable = (props: any) => {
  const { items, setItems, columns, count, parentPropId } = props;

  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    defaultValue,
    options,
    ...restProps
  }) => {
    const _defaultValue =
      record && (record[dataIndex] || record[dataIndex] === false || record[dataIndex] === 0)
        ? record[dataIndex]
        : defaultValue;

    let inputNode = null;
    switch (inputType) {
      case "number":
        inputNode = (
          <InputNumber
            defaultValue={_defaultValue}
            onChange={(value) => {
              onChangeValue(value, dataIndex, record.uuid);
            }}
          />
        );
        break;
      case "string":
        inputNode = (
          <Input defaultValue={_defaultValue} onChange={(e) => onChangeValue(e.target.value, dataIndex, record.uuid)} />
        );
        break;
      case "boolean":
        inputNode = (
          <Checkbox
            defaultChecked={_defaultValue ?? false}
            onChange={(e: CheckboxChangeEvent) => onChangeValue(e.target.checked, dataIndex, record.uuid)}
          />
        );
        break;
      case "array":
        inputNode = (
          <Select
            defaultValue={_defaultValue}
            onChange={(e) => onChangeValue(e, dataIndex, record.uuid)}
            options={options}
          />
        );
        break;
    }

    return <td {...restProps}>{editing ? <>{inputNode}</> : children}</td>;
  };

  const mergedColumns = columns.map((col: any, index: number) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.type,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
        index: index,
        defaultValue: col.defaultValue,
        options: col.options,
      }),
    };
  });

  const onChangeValue = (value: number | string | boolean, dataIndex: string, uuid: string) => {
    const index = items.findIndex((i: any) => i.uuid === uuid);
    items[index][dataIndex] = value;
    setItems(items);
  };

  const setItemsByCount = (count: number) => {
    if (count) {
      const data = [];
      let item = {};
      for (const column of columns) {
        if (column.editable) {
          item = { ...item, [column.dataIndex]: column.defaultValue };
        }
      }
      for (let i = 0; i < count; i++) {
        item = {
          ...item,
          uuid: "" + i,
          [parentPropId.key]: parentPropId.value,
        };
        data.push(item);
      }
      setItems(data);
    }
  };

  useEffect(() => {
    setItemsByCount(count);
  }, [count]);

  return (
    <RbTable
      rowKey="uuid"
      rowClassName="editable-row"
      bordered
      dataSource={items}
      columns={mergedColumns}
      components={{
        body: {
          cell: EditableCell,
        },
      }}
    />
  );
};
