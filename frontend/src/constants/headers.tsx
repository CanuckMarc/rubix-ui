import { Image, Tag } from "antd";
import { pluginLogo } from "../utils/utils";
import imageRC5 from "../assets/images/RC5.png";
import imageRCIO from "../assets/images/RC-IO.png";
import imageEdge28 from "../assets/images/Edge-iO-28.png";

export const FLOW_NETWORKS_HEADERS = [
  {
    key: "flow_ip",
    title: "ip",
    dataIndex: "flow_ip",
    sorter: (a: any, b: any) => sortIps(a.flow_ip ?? '', b.flow_ip ?? ''),
  },
  {
    key: "flow_port",
    title: "port",
    dataIndex: "flow_port",
    sorter: (a: any, b: any) => (a.flow_port ?? 0) - (b.flow_port ?? 0),
  },
  {
    key: "client_name",
    title: "client name",
    dataIndex: "client_name",
    sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
  },
  {
    key: "site_name",
    title: "site name",
    dataIndex: "site_name",
    sorter: (a: any, b: any) => a.client_name.localeCompare(b.client_name),
  },
  {
    key: "device_name",
    title: "device name",
    dataIndex: "device_name",
    sorter: (a: any, b: any) => a.device_name.localeCompare(b.device_name),
  },
  {
    key: "message",
    title: "message",
    dataIndex: "message",
  },
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const STREAM_HEADERS = [
  {
    key: "name",
    title: "name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "enable",
    key: "enable",
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
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const CONSUMER_HEADERS = [
  {
    key: "name",
    title: "name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "enable",
    key: "enable",
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
    title: "message",
    dataIndex: "message",
  },
  {
    key: "producer_thing_class",
    title: "producer thing class",
    dataIndex: "producer_thing_class",
    sorter: (a: any, b: any) => a.producer_thing_class.localeCompare(b.producer_thing_class),
  },
  {
    key: "producer_thing_name",
    title: "producer thing name",
    dataIndex: "producer_thing_name",
    sorter: (a: any, b: any) => a.producer_thing_name.localeCompare(b.producer_thing_name),
  },
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const PRODUCER_HEADERS = [
  {
    key: "name",
    title: "name",
    dataIndex: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    key: "producer_application",
    title: "application",
    dataIndex: "producer_application",
    sorter: (a: any, b: any) => a.producer_application.localeCompare(b.producer_application),
  },
  {
    key: "producer_thing_class",
    title: "thing class",
    dataIndex: "producer_thing_class",
    sorter: (a: any, b: any) => a.producer_thing_class.localeCompare(b.producer_thing_class),
  },
  {
    key: "producer_thing_name",
    title: "thing name",
    dataIndex: "producer_thing_name",
    sorter: (a: any, b: any) => a.producer_thing_name.localeCompare(b.producer_thing_name),
  },
  {
    key: "history_type",
    title: "history type",
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
    title: "history interval",
    dataIndex: "history_interval",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "enable",
    key: "enable",
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
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const WRITER_HEADERS = [
  {
    key: "writer_thing_class",
    title: "writer thing class",
    dataIndex: "writer_thing_class",
    sorter: (a: any, b: any) => a.writer_thing_class.localeCompare(b.writer_thing_class),
  },
  {
    key: "writer_thing_name",
    title: "writer thing name",
    dataIndex: "writer_thing_name",
    sorter: (a: any, b: any) => a.writer_thing_name.localeCompare(b.writer_thing_name),
  },
  {
    key: "uuid",
    title: "uuid",
    dataIndex: "uuid",
  },
];

export const CONNECTION_HEADERS = [
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "address",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => a.ip.localeCompare(b.ip),
  },
  {
    title: "port",
    dataIndex: "port",
    key: "port",
    sorter: (a: any, b: any) => a.port - b.port,
  },
  {
    title: "enable",
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
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const HOST_NETWORK_HEADERS = [
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "controllers number",
    dataIndex: "hosts",
    key: "hosts",
    render: (hosts: []) => <a>{hosts ? hosts.length : 0}</a>,
  },

  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const HOST_HEADERS = [
  {
    title: "product",
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
    title: "name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "ip",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => sortIps(a.ip ?? '', b.ip ?? ''),
  },
  {
    title: "description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
  {
    title: "global_uuid",
    dataIndex: "global_uuid",
    key: "global_uuid",
  },
  {
    title: "is_online",
    dataIndex: "is_online",
    key: "is_online",
    render: (a: any) => '' + (a ?? ''),
    sorter: (a: any, b: any) => a.is_online - b.is_online,
  },
  {
    title: "is_valid_token",
    dataIndex: "is_valid_token",
    key: "is_valid_token",
    render: (a: any) => '' + (a ?? ''),
    sorter: (a: any, b: any) => a.is_valid_token - b.is_valid_token,
  },
  {
    title: "virtual_ip",
    dataIndex: "virtual_ip",
    key: "virtual_ip",
    sorter: (a: any, b: any) => sortIps(a.virtual_ip ?? '', b.virtual_ip ?? ''),
  },
  {
    title: "received_bytes",
    dataIndex: "received_bytes",
    key: "received_bytes",
    sorter: (a: any, b: any) => (a.received_bytes ?? 0) - (b.received_bytes ?? 0),
  },
  {
    title: "sent_bytes",
    dataIndex: "sent_bytes",
    key: "sent_bytes",
    sorter: (a: any, b: any) => (a.received_bytes ?? 0) - (b.received_bytes ?? 0),
  },
  {
    title: "connected_since",
    dataIndex: "connected_since",
    key: "connected_since",
    sorter: (a: any, b: any) => (a.connected_since ?? '').localeCompare(b.connected_since ?? ''),
  },
];

const sortIps = (a: string, b: string) => {
  const num1 = Number(a.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
  const num2 = Number(b.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
  return ('' + num1).localeCompare('' + num2);
};

export const NETWORK_HEADERS = [
  {
    title: "network",
    key: "plugin_name",
    dataIndex: "plugin_name",
    render(name: string) {
      let image = pluginLogo(name);
      return <Image width={70} preview={false} src={image} />;
    },
  },
  {
    title: "network-type",
    key: "plugin_name",
    dataIndex: "plugin_name",
    render(plugin_name: string) {
      let colour = "#4d4dff";
      let text = plugin_name.toUpperCase();
      return <Tag color={colour}>{text}</Tag>;
    },
    sorter: (a: any, b: any) => a.plugin_name.localeCompare(b.plugin_name),
  },
  {
    title: "uuid",
    dataIndex: "uuid",
    key: "uuid",
  },
];

export const FLOW_DEVICE_HEADERS = [
  {
    title: "enable",
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
    title: "auto_mapping_enable",
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
];

export const FLOW_POINT_HEADERS = [
  {
    title: "name",
    dataIndex: "name",
    key: "name",
    render(name: string) {
      if (name != undefined) {
        let colour = "#4d4dff";
        return <Tag color={colour}>{name}</Tag>;
      }
    },
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
  },
  {
    title: "enable",
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
    title: "object type",
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
    title: "object id",
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
    title: "io number",
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
    title: "io type",
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
];

export const FLOW_POINT_HEADERS_TABLE = [
  //will render in the table but not the form
  {
    title: "present value",
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
    title: "original value",
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
    title: "write value",
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
    title: "message",
    dataIndex: "message",
    key: "message",
  },
];

export const PLUGIN_HEADERS = [
  {
    title: "name",
    key: "name_image",
    dataIndex: "name",
    render(name: string) {
      let image = pluginLogo(name);
      return <Image preview={false} width={70} src={image} />;
    },
  },
  {
    title: "name",
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
    title: "tags",
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
    sorter: (a: any, b: any) => a.enabled - b.enabled,
  },
  {
    title: "uuid",
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
    title: "ip",
    dataIndex: "ip",
    key: "ip",
    sorter: (a: any, b: any) => a.ip.localeCompare(b.ip),
  },
  {
    title: "ports",
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
    render: (text: any) => String(text)
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
    }
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
    }
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
    }
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
    }
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
    }
  }
];

//--------------schema-------------//
export const LOCAL_FLOW_NETWORKS_SCHEMA = {
  required: [
    "name"
  ],
  properties: {
    name: {
      title: "name",
      type: "string",
      maxLength: 50,
      minLength: 2,
    },
    is_remote: {
      type: "boolean",
      title: "is remote network",
    }
  }
};

export const REMOTE_FLOW_NETWORKS_SCHEMA = {
  required: [
    "name",
    "flow_ip_local",
    "flow_ip",
    "flow_port_local",
    "flow_port",
    "flow_token_local",
    "flow_token"
  ],
  properties: {
    name: {
      title: "name",
      type: "string",
      maxLength: 50,
      minLength: 2,
    },
    is_remote: {
      type: "boolean",
      title: "is remote network",
    },
    flow_ip_local: {
      type: "string",
      title: "flow ip local",
      default: "10.8.1.1",
      minLength: 6,
      maxLength: 100,
    },
    flow_ip: {
      type: "string",
      title: "flow ip remote",
      default: "10.8.1.1",
      minLength: 6,
      maxLength: 100,
    },
    flow_port_local: {
      type: "number",
      title: "flow port local",
      minimum: 1,
      maximum: 65535,
      default: 1660,
    },
    flow_port: {
      type: "number",
      title: "flow port remote",
      minimum: 1,
      maximum: 65535,
      default: 1660,
    },
    flow_token_local: {
      title: "token local",
      type: "string",
      minLength: 60,
      maxLength: 60,
    },
    flow_token: {
      title: "token remote",
      type: "string",
      minLength: 60,
      maxLength: 60,
    }
  }
};

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
  }
];
