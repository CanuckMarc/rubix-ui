import { Image, Tag } from "antd";
import { pluginLogo } from "../utils/utils";
import imageRC5 from "../assets/images/RC5.png";
import imageRCIO from "../assets/images/RC-IO.png";
import imageEdge28 from "../assets/images/Edge-iO-28.png";
import moment from "moment";

export const FLOW_NETWORK_HEADERS = [
  {
    key: "flow_ip",
    title: "IP",
    dataIndex: "flow_ip",
    sorter: (a: any, b: any) => sortIps(a.flow_ip ?? "", b.flow_ip ?? ""),
  },
  {
    key: "flow_port",
    title: "Port",
    dataIndex: "flow_port",
    sorter: (a: any, b: any) => (a.flow_port ?? 0) - (b.flow_port ?? 0),
  },
  {
    key: "client_name",
    title: "Client Name",
    dataIndex: "client_name",
    sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
  },
  {
    key: "site_name",
    title: "Site Name",
    dataIndex: "site_name",
    sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
  },
  {
    key: "device_name",
    title: "Device Name",
    dataIndex: "device_name",
    sorter: (a: any, b: any) => a.device_name.localeCompare(b.device_name),
  },
  {
    key: "message",
    title: "Message",
    dataIndex: "message",
  },
  {
    key: "uuid",
    title: "UUID",
    dataIndex: "uuid",
  },
];

export const STREAM_HEADERS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "enable",
    title: "Enable",
    dataIndex: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    key: "uuid",
    title: "UUID",
    dataIndex: "uuid",
  },
];

export const STREAM_CLONE_HEADERS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "enable",
    title: "Enable",
    dataIndex: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    key: "message",
    title: "Message",
    dataIndex: "message",
  },
  {
    key: "uuid",
    title: "UUID",
    dataIndex: "uuid",
  },
];

export const PRODUCER_HEADERS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "enable",
    title: "Enable",
    dataIndex: "enable",
    render(enabled: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enabled) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    key: "enable_history",
    title: "Enable History",
    dataIndex: "enable_history",
    render(enabled: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enabled) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    key: "producer_thing_name",
    title: "Thing Name",
    dataIndex: "producer_thing_name",
    sorter: (a: any, b: any) => a.producer_thing_name.localeCompare(b.producer_thing_name),
  },
  {
    key: "producer_thing_uuid",
    title: "Thing UUID",
    dataIndex: "producer_thing_uuid",
    sorter: (a: any, b: any) => a.producer_thing_uuid.localeCompare(b.producer_thing_uuid),
  },
  {
    key: "history_type",
    title: "History Type",
    dataIndex: "history_type",
    render(plugin_name: string) {
      let colour = "#4d4dff";
      let text = plugin_name.toUpperCase();
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.history_type.localeCompare(b.history_type),
  },
  {
    key: "history_interval",
    title: "History Interval",
    dataIndex: "history_interval",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "uuid",
    title: "UUID",
    dataIndex: "uuid",
  },
];

export const CONSUMER_HEADERS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "enable",
    title: "Enable",
    dataIndex: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enabled";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    key: "producer_uuid",
    title: "Producer UUID",
    dataIndex: "producer_uuid",
    sorter: (a: any, b: any) => a.producer_uuid.localeCompare(b.producer_uuid),
  },
  {
    key: "producer_thing_name",
    title: "Producer Thing Name",
    dataIndex: "producer_thing_name",
    sorter: (a: any, b: any) => a.producer_thing_name.localeCompare(b.producer_thing_name),
  },
  {
    key: "producer_thing_uuid",
    title: "Producer Thing UUID",
    dataIndex: "producer_thing_uuid",
    sorter: (a: any, b: any) => a.producer_thing_uuid.localeCompare(b.producer_thing_uuid),
  },
  {
    key: "message",
    title: "Message",
    dataIndex: "message",
  },
  {
    key: "uuid",
    title: "UUID",
    dataIndex: "uuid",
  },
];

export const WRITER_HEADERS = [
  {
    key: "writer_thing_name",
    title: "Thing Name",
    dataIndex: "writer_thing_name",
    sorter: (a: any, b: any) => a.writer_thing_name.localeCompare(b.writer_thing_name),
  },
  {
    key: "writer_thing_uuid",
    title: "Thing UUID",
    dataIndex: "writer_thing_uuid",
    sorter: (a: any, b: any) => a.writer_thing_uuid.localeCompare(b.writer_thing_uuid),
  },
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const WRITER_CLONE_HEADERS = [
  {
    key: "writer_thing_name",
    title: "Thing Name",
    dataIndex: "writer_thing_name",
    sorter: (a: any, b: any) => a.writer_thing_name.localeCompare(b.writer_thing_name),
  },
  {
    key: "writer_thing_uuid",
    title: "Thing UUID",
    dataIndex: "writer_thing_uuid",
    sorter: (a: any, b: any) => a.writer_thing_uuid.localeCompare(b.writer_thing_uuid),
  },
  {
    key: "message",
    title: "Message",
    dataIndex: "message",
  },
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const CONNECTION_HEADERS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Address",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => a.ip.localeCompare(b.ip),
  },
  {
    title: "Port",
    dataIndex: "port",
    key: "port",
    sorter: (a: any, b: any) => a.port - b.port,
  },
  {
    title: "HTTPS",
    key: "https",
    dataIndex: "https",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.https - b.https,
  },
  {
    title: "Enable",
    key: "enable",
    dataIndex: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
];

export const LOCATION_HEADERS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "UUID",
    dataIndex: "uuid",
    key: "uuid",
  },
  {
    title: "Networks Count",
    dataIndex: "networks",
    key: "networks",
    render: (networks: []) => <a>{networks ? networks.length : 0}</a>,
  },
];

export const HOST_NETWORK_HEADERS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "UUID",
    dataIndex: "uuid",
    key: "uuid",
  },
  {
    title: "Controllers Count",
    dataIndex: "hosts",
    key: "hosts",
    render: (hosts: []) => <a>{hosts ? hosts.length : 0}</a>,
  },
];

export const HOST_HEADERS = [
  {
    title: "Product",
    key: "product_type",
    dataIndex: "product_type",
    render(product: string) {
      let image = imageRC5;
      if (product == "RubixCompute") {
        image = imageRC5;
      }
      if (product == "RubixComputeIO") {
        image = imageRCIO;
      }
      if (product == "Edge28") {
        image = imageEdge28;
      }
      return <Image width={70} src={image} />;
    },
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "IP",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => sortIps(a.ip ?? "", b.ip ?? ""),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "UUID",
    dataIndex: "uuid",
    key: "uuid",
  },
  {
    title: "Global UUID",
    dataIndex: "global_uuid",
    key: "global_uuid",
  },
  {
    title: "Is Online",
    dataIndex: "is_online",
    key: "is_online",
    render: (a: boolean) => {
      let colour = "red";
      let text = "Offline";
      if (a) {
        colour = "green";
        text = "Online";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.is_online - b.is_online,
  },
  {
    title: "Is Valid Token",
    dataIndex: "is_valid_token",
    key: "is_valid_token",
    render: (a: any) => "" + (a ?? ""),
    sorter: (a: any, b: any) => a.is_valid_token - b.is_valid_token,
  },
  {
    title: "Virtual IP",
    dataIndex: "virtual_ip",
    key: "virtual_ip",
    sorter: (a: any, b: any) => sortIps(a.virtual_ip ?? "", b.virtual_ip ?? ""),
  },
  {
    title: "Received Bytes",
    dataIndex: "received_bytes",
    key: "received_bytes",
    sorter: (a: any, b: any) => (a.received_bytes ?? 0) - (b.received_bytes ?? 0),
  },
  {
    title: "Sent Bytes",
    dataIndex: "sent_bytes",
    key: "sent_bytes",
    sorter: (a: any, b: any) => (a.received_bytes ?? 0) - (b.received_bytes ?? 0),
  },
  {
    title: "Connected Since",
    dataIndex: "connected_since",
    key: "connected_since",
    sorter: (a: any, b: any) => (a.connected_since ?? "").localeCompare(b.connected_since ?? ""),
  },
];

const sortIps = (a: string, b: string) => {
  const num1 = Number(
    a
      .split(".")
      .map((num) => `000${num}`.slice(-3))
      .join("")
  );
  const num2 = Number(
    b
      .split(".")
      .map((num) => `000${num}`.slice(-3))
      .join("")
  );
  return ("" + num1).localeCompare("" + num2);
};

export const NETWORK_HEADERS = [
  {
    dataIndex: "name",
    title: "Name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "plugin_name",
    title: "Network",
    dataIndex: "plugin_name",
    render(name: string) {
      let image = pluginLogo(name);
      return <Image width={70} preview={false} src={image} />;
    },
  },
  {
    key: "plugin_name",
    title: "Network Type",
    dataIndex: "plugin_name",
    render(plugin_name: string) {
      let colour = "#4d4dff";
      let text = plugin_name.toUpperCase();
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.plugin_name.localeCompare(b.plugin_name),
  },
  {
    title: "UUID",
    key: "uuid",
    dataIndex: "uuid",
  },
];

export const FLOW_DEVICE_HEADERS = [
  {
    title: "Enable",
    dataIndex: "enable",
    key: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    title: "Auto Mapping Enable",
    key: "auto_mapping_enable",
    dataIndex: "auto_mapping_enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    title: "UUID",
    key: "uuid",
    dataIndex: "uuid",
  },
];

export const FLOW_POINT_HEADERS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    fixed: "left",
    render(name: string) {
      if (name != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{name}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "Enable",
    key: "enable",
    dataIndex: "enable",
    render(enable: boolean) {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.enable - b.enable,
  },
  {
    title: "Object Type",
    dataIndex: "object_type",
    key: "object_type",
    render(object_type: string) {
      if (object_type != undefined) {
        let colour = "#4d4dff";
        let text = object_type.toUpperCase();
        return <Tag color={colour}>{text}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.object_type.localeCompare(b.object_type),
  },
  {
    title: "Object Id",
    dataIndex: "object_id",
    key: "object_id",
    render(object_id: number) {
      if (object_id != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{object_id}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.object_id - b.object_id,
  },
  {
    title: "IO Number",
    dataIndex: "io_number",
    key: "io_number",
    render(io_number: string) {
      if (io_number != undefined) {
        let colour = "#4d4dff";
        let text = io_number.toUpperCase();
        return <Tag color={colour}>{text}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.io_number - b.io_number,
  },
  {
    title: "IO Type",
    dataIndex: "io_type",
    key: "io_type",
    render(io_type: string) {
      if (io_type != undefined) {
        let colour = "#4d4dff";
        let text = io_type.toUpperCase();
        return <Tag color={colour}>{text}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.io_type.localeCompare(b.io_type),
  },
  {
    title: "UUID",
    key: "uuid",
    dataIndex: "uuid",
    fixed: "left",
  },
];

export const FLOW_POINT_HEADERS_TABLE = [
  {
    title: "Present Value",
    dataIndex: "present_value",
    key: "present_value",
    render(present_value: number) {
      if (present_value != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{present_value}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.present_value - b.present_value,
  },
  {
    title: "Original Value",
    dataIndex: "original_value",
    key: "original_value",
    render(original_value: number) {
      if (original_value != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{original_value}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.original_value - b.original_value,
  },
  {
    title: "Write Value",
    dataIndex: "write_value",
    key: "write_value",
    render(write_value: number) {
      if (write_value != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{write_value}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.write_value - b.write_value,
  },
  {
    title: "Current Priority",
    dataIndex: "current_priority",
    key: "current_priority",
    render(current_priority: number) {
      if (current_priority != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{current_priority}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.current_priority - b.current_priority,
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
  },
];

export const PLUGIN_HEADERS = [
  {
    title: "Image",
    key: "name_image",
    dataIndex: "name",
    render(name: string) {
      let image = pluginLogo(name);
      return <Image preview={false} width={70} src={image} />;
    },
  },
  {
    title: "Name",
    key: "name",
    dataIndex: "name",
    render(plugin_name: string) {
      let colour = "#4d4dff";
      let text = plugin_name.toUpperCase();
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "Tags",
    key: "has_network",
    dataIndex: "has_network",
    render(has_network: boolean) {
      let colour = "blue";
      let text = "non network plugin";
      if (has_network) {
        colour = "orange";
        text = "network driver";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.has_network - b.has_network,
  },
  {
    title: "Status",
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
    sorter: (a: any, b: any) => a.enabled - b.enabled,
  },
  {
    title: "UUID",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const BACNET_HEADERS = [
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "device id",
    dataIndex: "device_object_id",
    key: "device_object_id",
    sorter: (a: any, b: any) => a.device_object_id.localeCompare(b.device_object_id),
  },
  {
    title: "ip",
    dataIndex: "host",
    key: "host",
    sorter: (a: any, b: any) => a.host.localeCompare(b.host),
  },
  {
    title: "port",
    dataIndex: "port",
    key: "port",
  },
];

export const LOG_HEADERS = [
  {
    title: "timestamp",
    dataIndex: "time",
    key: "time",
    sorter: (a: any, b: any) => a.time.localeCompare(b.time),
  },
  {
    title: "table",
    dataIndex: "function",
    key: "function",
    sorter: (a: any, b: any) => a.function.localeCompare(b.function),
  },
  {
    title: "action type",
    dataIndex: "type",
    key: "type",
    sorter: (a: any, b: any) => a.type.localeCompare(b.type),
  },
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const BACKUP_HEADERS = [
  {
    title: "connection name",
    dataIndex: "connection_name",
    key: "connection_name",
    sorter: (a: any, b: any) => a.connection_name.localeCompare(b.connection_name),
  },
  {
    title: "connection uuid",
    dataIndex: "connection_uuid",
    key: "connection_uuid",
  },
  {
    title: "host name",
    dataIndex: "host_name",
    key: "host_name",
    sorter: (a: any, b: any) => a.host_name.localeCompare(b.host_name),
  },
  {
    title: "host uuid",
    dataIndex: "host_uuid",
    key: "host_uuid",
  },
  {
    title: "timestamp",
    dataIndex: "time",
    key: "time",
    sorter: (a: any, b: any) => a.time.localeCompare(b.time),
  },
  {
    title: "application",
    dataIndex: "application",
    key: "application",
    sorter: (a: any, b: any) => a.application.localeCompare(b.application),
  },
  {
    title: "info",
    dataIndex: "backup_info",
    key: "backup_info",
    sorter: (a: any, b: any) => a.backup_info.localeCompare(b.backup_info),
  },
  {
    title: "comments",
    dataIndex: "user_comment",
    key: "user_comment",
  },
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const SCANNER_HEADERS = [
  {
    title: "IP",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => a.ip.localeCompare(b.ip),
  },
  {
    title: "Ports",
    dataIndex: "ports",
    render: (services: any[]) =>
      services.map((service, index) => <p key={index}> {`${service.service}: ${service.port}`} </p>),
    key: "ports",
  },
];

export const NETWORKING_HEADERS = [
  {
    title: "gateway",
    key: "gateway",
    dataIndex: "gateway",
  },
  {
    title: "interface",
    key: "interface",
    dataIndex: "interface",
  },
  {
    title: "ip",
    key: "ip",
    dataIndex: "ip",
  },
  {
    title: "ip and mask",
    key: "ip_and_mask",
    dataIndex: "ip_and_mask",
  },
  {
    title: "mac address",
    key: "mac_address",
    dataIndex: "mac_address",
  },
  {
    title: "netmask",
    key: "netmask",
    dataIndex: "netmask",
  },
];

export const WIRES_CONNECTIONS_HEADERS = [
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "host",
    dataIndex: "host",
    key: "host",
    sorter: (a: any, b: any) => a.host.localeCompare(b.host),
  },
  {
    title: "port",
    dataIndex: "port",
    key: "port",
  },
  {
    title: "application",
    dataIndex: "application",
    key: "application",
    sorter: (a: any, b: any) => a.application.localeCompare(b.application),
  },
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const SCHEDULES_HEADERS = [
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
    sorter: (a: any, b: any) => a.uuid.localeCompare(b.uuid),
  },
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "time zone",
    dataIndex: "timezone",
    key: "timezone",
    render: (text: any) => String(text),
  },
  {
    title: "enable",
    dataIndex: "enable",
    key: "enable",
    render: (enable: any) => {
      let colour = "blue";
      let text = "disabled";
      if (enable) {
        colour = "orange";
        text = "enable";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  {
    title: "is active",
    dataIndex: "is_active",
    key: "is_active",
    render: (enable: any) => {
      let colour = "blue";
      let text = "inactive";
      if (enable) {
        colour = "orange";
        text = "active";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  {
    title: "active weekly",
    dataIndex: "active_weekly",
    key: "active_weekly",
    render: (enable: any) => {
      let colour = "blue";
      let text = "inactive";
      if (enable) {
        colour = "orange";
        text = "active";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  {
    title: "active exception",
    dataIndex: "active_exception",
    key: "active_exception",
    render: (enable: any) => {
      let colour = "blue";
      let text = "inactive";
      if (enable) {
        colour = "orange";
        text = "active";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  {
    title: "active event",
    dataIndex: "active_event",
    key: "active_event",
    render: (enable: any) => {
      let colour = "blue";
      let text = "inactive";
      if (enable) {
        colour = "orange";
        text = "active";
      }
      return <Tag color={colour}>{text}</Tag>;
    },
  },
  {
    title: "Payload",
    dataIndex: "payload",
    key: "payload",
    render: (text: number) => String(text),
  },
  {
    title: "Next start",
    dataIndex: "next_start_string",
    key: "next_start_string",
    render: (text: string) => text,
  },
  {
    title: "Next stop",
    dataIndex: "next_stop_string",
    key: "next_stop_string",
    render: (text: string) => text,
  },
  {
    title: "Period start",
    dataIndex: "period_start_string",
    key: "period_start_string",
    render: (text: string) => text,
  },
  {
    title: "Period stop",
    dataIndex: "period_stop_string",
    key: "period_stop_string",
    render: (text: string) => text,
  },
];

export const LORAWAN_REMOTE_HEADERS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
  },
  {
    key: "description",
    title: "Description",
    dataIndex: "description",
  },
  {
    key: "devEUI",
    title: "EUI",
    dataIndex: "devEUI",
  },
  {
    key: "applicationID",
    title: "Application ID",
    dataIndex: "applicationID",
  },
  {
    key: "deviceProfileName",
    title: "Profile Name",
    dataIndex: "deviceProfileName",
  },
  {
    key: "deviceProfileID",
    title: "Profile ID",
    dataIndex: "deviceProfileID",
  },
  {
    key: "lastSeenAtReadable",
    title: "Last Seen At",
    dataIndex: "lastSeenAtReadable",
  },
  {
    key: "lastSeenAtTime",
    title: "Time Last Seen At",
    dataIndex: "lastSeenAtTime",
  },
];

//--------------schema-------------//

export const WIRES_CONNECTION_SCHEMA = {
  name: {
    maxLength: 50,
    minLength: 2,
    title: "name",
    type: "string",
  },
  host: {
    type: "string",
    title: "host",
    default: "0.0.0.0",
  },
  port: {
    type: "number",
    title: "port",
    minLength: 2,
    maxLength: 65535,
    default: 1665,
    readOnly: false,
  },
  application: {
    type: "string",
    title: "application",
    default: "flow",
  },
  uuid: {
    readOnly: true,
    title: "uuid",
    type: "string",
  },
};

export const SCHEDULES_SCHEMA = [
  {
    maxLength: 50,
    minLength: 2,
    title: "name",
    type: "string",
  },
  {
    readOnly: true,
    title: "uuid",
    type: "string",
  },
  {
    readOnly: true,
    title: "enable",
    type: "boolean",
  },
  {
    readOnly: true,
    title: "active",
    type: "boolean",
  },
];
