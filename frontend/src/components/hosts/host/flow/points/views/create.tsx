import {
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { useEffect, useState } from "react";
import { FlowPointFactory } from "../factory";
import { JsonForm } from "../../../../../../common/json-schema-form";
import { model } from "../../../../../../../wailsjs/go/models";

import Point = model.Point;
import React from "react";

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

export const CreateBulkModal = (props: any) => {
  const {
    isModalVisible,
    isLoadingForm,
    connUUID,
    hostUUID,
    deviceUUID,
    schema,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [count, setCount] = useState<any>(undefined);
  const [items, setItems] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

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
      record && record[dataIndex] ? record[dataIndex] : defaultValue;

    let inputNode = null;
    switch (inputType) {
      case "number":
        inputNode = (
          <InputNumber
            defaultValue={_defaultValue}
            onChange={(e) => onChange(e.target.value, dataIndex, record.key)}
          />
        );
        break;
      case "string":
        inputNode = (
          <Input
            defaultValue={_defaultValue}
            onChange={(e) => onChange(e.target.value, dataIndex, record.key)}
          />
        );
        break;
      case "boolean":
        inputNode = (
          <Checkbox
            defaultChecked={_defaultValue ?? false}
            onChange={(e: CheckboxChangeEvent) =>
              onChange(e.target.checked, dataIndex, record.key)
            }
          />
        );
        break;
      case "array":
        inputNode = (
          <Select
            defaultValue={_defaultValue}
            onChange={(e) => onChange(e, dataIndex, record.key)}
            options={options}
          />
        );
        break;
    }

    return <td {...restProps}>{editing ? <>{inputNode}</> : children}</td>;
  };

  const mergedColumns = columns.map((col, index) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.options.length > 0 ? "array" : col.type,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
        index: index,
        defaultValue: col.defaultValue,
        options: col.options,
      }),
    };
  });

  const createColumns = () => {
    if (!schema.properties) return;

    ////setItems is not working well, so temporarily we don't support deleting
    // const columns = [
    //   {
    //     title: "actions",
    //     dataIndex: "actions",
    //     render: (_: any, record: any) => {
    //       return (
    //         <div style={{ textAlign: "center" }}>
    //           <DeleteOutlined
    //             style={{ color: "red" }}
    //             onClick={() => deleteItem(record.key)}
    //           />
    //         </div>
    //       );
    //     },
    //   },
    // ];

    const columns: any[] = [];
    const properties = schema.properties;
    Object.keys(properties).forEach((key) => {
      if (key !== "uuid" && properties[key].type) {
        //handle select input
        const options = [];
        if (properties[key].enum) {
          for (let i = 0; i < properties[key].enum.length; i++) {
            options.push({
              value: properties[key].enum[i],
              label: properties[key].enumNames
                ? properties[key].enumNames[i]
                : properties[key].enum[i],
            });
          }
        }
        const column = {
          key: key,
          title: key.replaceAll("_", " "),
          dataIndex: key,
          type: properties[key].type,
          editable: !properties[key].readOnly || false,
          defaultValue: properties[key].default || undefined,
          options: options,
        } as any;

        columns.push(column);
      }
    });
    setColumns(columns);
  };

  const handleClose = () => {
    setItems([]);
    setCount(undefined);
    onCloseModal();
  };

  const onChange = (
    value: number | string | boolean,
    dataIndex: string,
    key: number
  ) => {
    const index = items.findIndex((i) => i.key === key);
    items[index][dataIndex] = value;
    setItems(items);
  };

  const onCountChange = (count: number) => {
    const data = [];
    let item = {};
    for (const column of columns) {
      if (column.editable) {
        item = { ...item, [column.dataIndex]: column.defaultValue };
      }
    }
    for (let i = 0; i < count; i++) {
      item = { ...item, key: i, device_uuid: deviceUUID };
      data.push(item);
    }
    setItems(data);
    setCount(count);
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.AddBulk(items);
      refreshList();
      handleClose();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  // const deleteItem = (key: number) => {
  //   const newItems = items.filter((i) => i.key !== key);
  //   const newCount = count - 1;
  //   setItems(newItems);
  //   !newCount ? setCount(undefined) : setCount(newCount);
  // };

  useEffect(() => {
    if (!isLoadingForm) {
      createColumns();
    }
  }, [isLoadingForm]);

  return (
    <Modal
      title="Add New Bulk"
      visible={isModalVisible}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false}
      style={{ textAlign: "start" }}
      width={"auto"}
    >
      <InputNumber
        min={1}
        onChange={onCountChange}
        style={{ width: "100%", marginBottom: "1.5rem" }}
        placeholder="please enter count"
        value={count}
      />
      {count && (
        <Form component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={items}
            columns={mergedColumns}
            rowClassName="editable-row"
          />
        </Form>
      )}
    </Modal>
  );
};

export const CreateModal = (props: any) => {
  const {
    isModalVisible,
    isLoadingForm,
    connUUID,
    hostUUID,
    deviceUUID,
    schema,
    onCloseModal,
    refreshList,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formData, setFormData] = useState({} as Point);

  const factory = new FlowPointFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const add = async (point: Point) => {
    await factory.Add(deviceUUID, point);
  };

  const handleClose = () => {
    setFormData({} as Point);
    onCloseModal();
  };

  const handleSubmit = async (point: Point) => {
    setConfirmLoading(true);
    await add(point);
    refreshList();
    setConfirmLoading(false);
    handleClose();
  };

  return (
    <Modal
      title="Add New"
      visible={isModalVisible}
      onOk={() => handleSubmit(formData)}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Save"
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <Spin spinning={isLoadingForm}>
        <JsonForm
          formData={formData}
          jsonSchema={schema}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
        />
      </Spin>
    </Modal>
  );
};
