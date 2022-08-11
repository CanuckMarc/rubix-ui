import { Tag } from "antd";

export const FLOW_NETWORK_HEADERS = [
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
  {
    key: "name",
    title: "name",
    dataIndex: "name",
  },
  {
    key: "client_name",
    title: "client name",
    dataIndex: "client_name",
  },
  {
    key: "device_name",
    title: "device name",
    dataIndex: "device_name",
  },
  // {
  //   key: "is_error",
  //   title: "error",
  //   dataIndex: "is_error",
  // },
  // {
  //   key: "is_master_slave",
  //   title: "master slave",
  //   dataIndex: "is_master_slave",
  // },
  // {
  //   key: "is_remote",
  //   title: "remote",
  //   dataIndex: "is_remote",
  // },
  {
    key: "message",
    title: "message",
    dataIndex: "message",
  },
  {
    key: "connection",
    title: "connection",
    dataIndex: "connection",
  },
];

export const STREAM_HEADERS = [
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
  {
    key: "name",
    title: "name",
    dataIndex: "name",
  },
  {
    title: "status",
    key: "enabled",
    dataIndex: "enabled",
    render(enabled: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enabled) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  // {
  //   key: "command_groups",
  //   title: "command groups",
  //   dataIndex: "command_groups",
  // },
  // {
  //   key: "producers",
  //   title: "producers",
  //   dataIndex: "producers",
  // },
  // {
  //   key: "tags",
  //   title: "tags",
  //   dataIndex: "tags",
  // },
  // {
  //   key: "flow_networks",
  //   title: "flow_networks",
  //   dataIndex: "flow_networks",
  // },
];
