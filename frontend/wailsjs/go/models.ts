export namespace amodel {
	
	export class AppSystemState {
	    service_name?: string;
	    app_name?: string;
	    state?: string;
	    active_state?: string;
	    sub_state?: string;
	    active_enter_timestamp?: string;
	    inactive_enter_timestamp?: string;
	    restarts?: string;
	    is_installed?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AppSystemState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.service_name = source["service_name"];
	        this.app_name = source["app_name"];
	        this.state = source["state"];
	        this.active_state = source["active_state"];
	        this.sub_state = source["sub_state"];
	        this.active_enter_timestamp = source["active_enter_timestamp"];
	        this.inactive_enter_timestamp = source["inactive_enter_timestamp"];
	        this.restarts = source["restarts"];
	        this.is_installed = source["is_installed"];
	    }
	}
	export class Host {
	    uuid: string;
	    network_uuid?: string;
	    name: string;
	    enable?: boolean;
	    description?: string;
	    ip: string;
	    bios_port: number;
	    port: number;
	    https?: boolean;
	    ping_enable?: boolean;
	    ping_frequency: number;
	    is_offline: boolean;
	    offline_count: number;
	    message?: string;
	    external_token: string;
	
	    static createFrom(source: any = {}) {
	        return new Host(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.network_uuid = source["network_uuid"];
	        this.name = source["name"];
	        this.enable = source["enable"];
	        this.description = source["description"];
	        this.ip = source["ip"];
	        this.bios_port = source["bios_port"];
	        this.port = source["port"];
	        this.https = source["https"];
	        this.ping_enable = source["ping_enable"];
	        this.ping_frequency = source["ping_frequency"];
	        this.is_offline = source["is_offline"];
	        this.offline_count = source["offline_count"];
	        this.message = source["message"];
	        this.external_token = source["external_token"];
	    }
	}
	export class NetworkUUID {
	    type: string;
	    title: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NetworkUUID(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class HostSchema {
	    uuid: schema.UUID;
	    network_uuid: NetworkUUID;
	    name: schema.Name;
	    enable: schema.Enable;
	    description: schema.Description;
	    ip: schema.Host;
	    bios_port: schema.Port;
	    port: schema.Port;
	    https: schema.HTTPS;
	    external_token: schema.Token;
	    required: string[];
	
	    static createFrom(source: any = {}) {
	        return new HostSchema(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = this.convertValues(source["uuid"], schema.UUID);
	        this.network_uuid = this.convertValues(source["network_uuid"], NetworkUUID);
	        this.name = this.convertValues(source["name"], schema.Name);
	        this.enable = this.convertValues(source["enable"], schema.Enable);
	        this.description = this.convertValues(source["description"], schema.Description);
	        this.ip = this.convertValues(source["ip"], schema.Host);
	        this.bios_port = this.convertValues(source["bios_port"], schema.Port);
	        this.port = this.convertValues(source["port"], schema.Port);
	        this.https = this.convertValues(source["https"], schema.HTTPS);
	        this.external_token = this.convertValues(source["external_token"], schema.Token);
	        this.required = source["required"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Network {
	    uuid: string;
	    name: string;
	    location_uuid?: string;
	    hosts: Host[];
	
	    static createFrom(source: any = {}) {
	        return new Network(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.location_uuid = source["location_uuid"];
	        this.hosts = this.convertValues(source["hosts"], Host);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Location {
	    uuid: string;
	    name: string;
	    description: string;
	    networks: Network[];
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.networks = this.convertValues(source["networks"], Network);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Message {
	    message: any;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
	

}

export namespace assistcli {
	
	export class Mqtt {
	    broker_ip: string;
	    broker_port: number;
	    debug: boolean;
	    enable: boolean;
	    write_via_subscribe: boolean;
	    retry_enable: boolean;
	    retry_limit: number;
	    retry_interval: number;
	
	    static createFrom(source: any = {}) {
	        return new Mqtt(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.broker_ip = source["broker_ip"];
	        this.broker_port = source["broker_port"];
	        this.debug = source["debug"];
	        this.enable = source["enable"];
	        this.write_via_subscribe = source["write_via_subscribe"];
	        this.retry_enable = source["retry_enable"];
	        this.retry_limit = source["retry_limit"];
	        this.retry_interval = source["retry_interval"];
	    }
	}
	export class ConfigBACnetServer {
	    server_name: string;
	    device_id: number;
	    port: number;
	    iface: string;
	    bi_max: number;
	    bo_max: number;
	    bv_max: number;
	    ai_max: number;
	    ao_max: number;
	    av_max: number;
	    mqtt: Mqtt;
	
	    static createFrom(source: any = {}) {
	        return new ConfigBACnetServer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.server_name = source["server_name"];
	        this.device_id = source["device_id"];
	        this.port = source["port"];
	        this.iface = source["iface"];
	        this.bi_max = source["bi_max"];
	        this.bo_max = source["bo_max"];
	        this.bv_max = source["bv_max"];
	        this.ai_max = source["ai_max"];
	        this.ao_max = source["ao_max"];
	        this.av_max = source["av_max"];
	        this.mqtt = this.convertValues(source["mqtt"], Mqtt);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Response {
	    code: number;
	    message: any;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.message = source["message"];
	    }
	}
	export class WhoIsOpts {
	    interface_port: string;
	    local_device_ip: string;
	    local_device_port: number;
	    local_device_id: number;
	    low: number;
	    high: number;
	    global_broadcast: boolean;
	    network_number: number;
	
	    static createFrom(source: any = {}) {
	        return new WhoIsOpts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.interface_port = source["interface_port"];
	        this.local_device_ip = source["local_device_ip"];
	        this.local_device_port = source["local_device_port"];
	        this.local_device_id = source["local_device_id"];
	        this.low = source["low"];
	        this.high = source["high"];
	        this.global_broadcast = source["global_broadcast"];
	        this.network_number = source["network_number"];
	    }
	}

}

export namespace backend {
	
	export class BulkAddResponse {
	    message: string;
	    added_count: number;
	    error_count: number;
	
	    static createFrom(source: any = {}) {
	        return new BulkAddResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	        this.added_count = source["added_count"];
	        this.error_count = source["error_count"];
	    }
	}
	export class Ip {
	    type: string;
	    title: string;
	    default: string;
	
	    static createFrom(source: any = {}) {
	        return new Ip(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.default = source["default"];
	    }
	}
	export class ConnectionSchema {
	    uuid: schema.UUID;
	    name: schema.Name;
	    description: schema.Description;
	    enable: schema.Enable;
	    ip: Ip;
	    port: schema.Port;
	    https: schema.HTTPS;
	    external_token: schema.Token;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionSchema(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = this.convertValues(source["uuid"], schema.UUID);
	        this.name = this.convertValues(source["name"], schema.Name);
	        this.description = this.convertValues(source["description"], schema.Description);
	        this.enable = this.convertValues(source["enable"], schema.Enable);
	        this.ip = this.convertValues(source["ip"], Ip);
	        this.port = this.convertValues(source["port"], schema.Port);
	        this.https = this.convertValues(source["https"], schema.HTTPS);
	        this.external_token = this.convertValues(source["external_token"], schema.Token);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class NetworksList {
	    name: string;
	    point_uuid: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworksList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.point_uuid = source["point_uuid"];
	    }
	}
	export class RcNetworkBody {
	    eth0_ip_settings: string;
	    eth0_interface: string;
	    eth0_ip: string;
	    eth0_netmask: string;
	    eth0_gateway: string;
	    eth1_ip_settings: string;
	    eth1_interface: string;
	    eth1_ip: string;
	    eth1_netmask: string;
	    eth1_gateway: string;
	
	    static createFrom(source: any = {}) {
	        return new RcNetworkBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.eth0_ip_settings = source["eth0_ip_settings"];
	        this.eth0_interface = source["eth0_interface"];
	        this.eth0_ip = source["eth0_ip"];
	        this.eth0_netmask = source["eth0_netmask"];
	        this.eth0_gateway = source["eth0_gateway"];
	        this.eth1_ip_settings = source["eth1_ip_settings"];
	        this.eth1_interface = source["eth1_interface"];
	        this.eth1_ip = source["eth1_ip"];
	        this.eth1_netmask = source["eth1_netmask"];
	        this.eth1_gateway = source["eth1_gateway"];
	    }
	}
	export class UUIDs {
	    name: string;
	    uuid: string;
	
	    static createFrom(source: any = {}) {
	        return new UUIDs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uuid = source["uuid"];
	    }
	}

}

export namespace datelib {
	
	export class Time {
	    // Go type: time.Time
	    date_stamp: any;
	    time_local: string;
	    time_utc: string;
	    current_day: string;
	    current_day_utc: string;
	    date_format_local: string;
	    date_format_utc: string;
	    system_time_zone: string;
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date_stamp = this.convertValues(source["date_stamp"], null);
	        this.time_local = source["time_local"];
	        this.time_utc = source["time_utc"];
	        this.current_day = source["current_day"];
	        this.current_day_utc = source["current_day_utc"];
	        this.date_format_local = source["date_format_local"];
	        this.date_format_utc = source["date_format_utc"];
	        this.system_time_zone = source["system_time_zone"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace db {
	
	export class Connection {
	    uuid: string;
	    enabled?: boolean;
	    application: string;
	    name?: string;
	    host?: string;
	    port?: number;
	    authentication?: boolean;
	    https?: boolean;
	    username?: string;
	    password?: string;
	    gmail?: string;
	    token?: string;
	    keepalive?: number;
	    qos?: number;
	    retain?: boolean;
	    attemptReconnectOnUnavailable?: boolean;
	    attemptReconnectSecs?: number;
	    timeout?: number;
	
	    static createFrom(source: any = {}) {
	        return new Connection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.enabled = source["enabled"];
	        this.application = source["application"];
	        this.name = source["name"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.authentication = source["authentication"];
	        this.https = source["https"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.gmail = source["gmail"];
	        this.token = source["token"];
	        this.keepalive = source["keepalive"];
	        this.qos = source["qos"];
	        this.retain = source["retain"];
	        this.attemptReconnectOnUnavailable = source["attemptReconnectOnUnavailable"];
	        this.attemptReconnectSecs = source["attemptReconnectSecs"];
	        this.timeout = source["timeout"];
	    }
	}

}

export namespace dhcpd {
	
	export class SetStaticIP {
	    ip: string;
	    net_mask: string;
	    i_face_name: string;
	    gateway_ip: string;
	    dns_ip: string;
	    check_interface_exists: boolean;
	    save_file: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SetStaticIP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip = source["ip"];
	        this.net_mask = source["net_mask"];
	        this.i_face_name = source["i_face_name"];
	        this.gateway_ip = source["gateway_ip"];
	        this.dns_ip = source["dns_ip"];
	        this.check_interface_exists = source["check_interface_exists"];
	        this.save_file = source["save_file"];
	    }
	}

}

export namespace ebmodel {
	
	export class Version {
	    version: string;
	
	    static createFrom(source: any = {}) {
	        return new Version(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	    }
	}

}

export namespace externaltoken {
	
	export class ExternalToken {
	    uuid: string;
	    name: string;
	    token: string;
	    blocked: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ExternalToken(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.token = source["token"];
	        this.blocked = source["blocked"];
	    }
	}

}

export namespace flowcli {
	
	export class NodesList {
	    nodes: string[];
	
	    static createFrom(source: any = {}) {
	        return new NodesList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nodes = source["nodes"];
	    }
	}
	export class SchemaBody {
	    title: string;
	    properties: any;
	
	    static createFrom(source: any = {}) {
	        return new SchemaBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.properties = source["properties"];
	    }
	}
	export class Schema {
	    schema: SchemaBody;
	    uiSchema: any;
	
	    static createFrom(source: any = {}) {
	        return new Schema(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.schema = this.convertValues(source["schema"], SchemaBody);
	        this.uiSchema = source["uiSchema"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace model {
	
	export class StreamClone {
	    name: string;
	    uuid: string;
	    sync_uuid: string;
	    description?: string;
	    enable?: boolean;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    source_uuid: string;
	    connection: string;
	    message: string;
	    flow_network_clone_uuid: string;
	    consumers: Consumer[];
	    tags: Tag[];
	
	    static createFrom(source: any = {}) {
	        return new StreamClone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.source_uuid = source["source_uuid"];
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.flow_network_clone_uuid = source["flow_network_clone_uuid"];
	        this.consumers = this.convertValues(source["consumers"], Consumer);
	        this.tags = this.convertValues(source["tags"], Tag);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CommandGroup {
	    uuid: string;
	    name: string;
	    enable?: boolean;
	    description?: string;
	    command_use?: string;
	    stream_uuid?: string;
	    write_value?: string;
	    write_priority?: string;
	    write_priority_array?: string;
	    write_json?: string;
	    start_date?: string;
	    end_date?: string;
	    value?: string;
	    priority?: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	
	    static createFrom(source: any = {}) {
	        return new CommandGroup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.enable = source["enable"];
	        this.description = source["description"];
	        this.command_use = source["command_use"];
	        this.stream_uuid = source["stream_uuid"];
	        this.write_value = source["write_value"];
	        this.write_priority = source["write_priority"];
	        this.write_priority_array = source["write_priority_array"];
	        this.write_json = source["write_json"];
	        this.start_date = source["start_date"];
	        this.end_date = source["end_date"];
	        this.value = source["value"];
	        this.priority = source["priority"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProducerHistory {
	    id: number;
	    producer_uuid?: string;
	    current_writer_uuid?: string;
	    present_value?: number;
	    data_store?: number[];
	    // Go type: time.Time
	    timestamp?: any;
	
	    static createFrom(source: any = {}) {
	        return new ProducerHistory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.producer_uuid = source["producer_uuid"];
	        this.current_writer_uuid = source["current_writer_uuid"];
	        this.present_value = source["present_value"];
	        this.data_store = source["data_store"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class WriterClone {
	    uuid: string;
	    sync_uuid: string;
	    writer_thing_class?: string;
	    writer_thing_type?: string;
	    writer_thing_uuid?: string;
	    writer_thing_name?: string;
	    data_store?: number[];
	    connection: string;
	    message: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    producer_uuid: string;
	    flow_framework_uuid?: string;
	    source_uuid: string;
	
	    static createFrom(source: any = {}) {
	        return new WriterClone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.writer_thing_class = source["writer_thing_class"];
	        this.writer_thing_type = source["writer_thing_type"];
	        this.writer_thing_uuid = source["writer_thing_uuid"];
	        this.writer_thing_name = source["writer_thing_name"];
	        this.data_store = source["data_store"];
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.producer_uuid = source["producer_uuid"];
	        this.flow_framework_uuid = source["flow_framework_uuid"];
	        this.source_uuid = source["source_uuid"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Producer {
	    uuid: string;
	    name: string;
	    description?: string;
	    enable?: boolean;
	    sync_uuid: string;
	    producer_thing_name?: string;
	    producer_thing_uuid?: string;
	    producer_thing_class?: string;
	    producer_thing_type?: string;
	    producer_application?: string;
	    current_writer_uuid?: string;
	    enable_history?: boolean;
	    stream_uuid?: string;
	    writer_clones?: WriterClone[];
	    producer_histories?: ProducerHistory[];
	    tags?: Tag[];
	    history_type?: string;
	    history_interval?: number;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	
	    static createFrom(source: any = {}) {
	        return new Producer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.sync_uuid = source["sync_uuid"];
	        this.producer_thing_name = source["producer_thing_name"];
	        this.producer_thing_uuid = source["producer_thing_uuid"];
	        this.producer_thing_class = source["producer_thing_class"];
	        this.producer_thing_type = source["producer_thing_type"];
	        this.producer_application = source["producer_application"];
	        this.current_writer_uuid = source["current_writer_uuid"];
	        this.enable_history = source["enable_history"];
	        this.stream_uuid = source["stream_uuid"];
	        this.writer_clones = this.convertValues(source["writer_clones"], WriterClone);
	        this.producer_histories = this.convertValues(source["producer_histories"], ProducerHistory);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.history_type = source["history_type"];
	        this.history_interval = source["history_interval"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FlowNetwork {
	    uuid: string;
	    sync_uuid: string;
	    name: string;
	    description?: string;
	    global_uuid?: string;
	    client_id?: string;
	    client_name?: string;
	    site_id?: string;
	    site_name?: string;
	    device_id?: string;
	    device_name?: string;
	    is_remote?: boolean;
	    fetch_histories?: boolean;
	    fetch_hist_frequency?: number;
	    delete_histories_on_fetch?: boolean;
	    is_master_slave?: boolean;
	    flow_https?: boolean;
	    flow_username?: string;
	    flow_password?: string;
	    flow_token?: string;
	    is_token_auth?: boolean;
	    is_error?: boolean;
	    error_msg?: string;
	    connection: string;
	    message: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    flow_network_parent_uuid: string;
	    flow_ip?: string;
	    flow_port?: number;
	    flow_token_local?: string;
	    streams: Stream[];
	
	    static createFrom(source: any = {}) {
	        return new FlowNetwork(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.global_uuid = source["global_uuid"];
	        this.client_id = source["client_id"];
	        this.client_name = source["client_name"];
	        this.site_id = source["site_id"];
	        this.site_name = source["site_name"];
	        this.device_id = source["device_id"];
	        this.device_name = source["device_name"];
	        this.is_remote = source["is_remote"];
	        this.fetch_histories = source["fetch_histories"];
	        this.fetch_hist_frequency = source["fetch_hist_frequency"];
	        this.delete_histories_on_fetch = source["delete_histories_on_fetch"];
	        this.is_master_slave = source["is_master_slave"];
	        this.flow_https = source["flow_https"];
	        this.flow_username = source["flow_username"];
	        this.flow_password = source["flow_password"];
	        this.flow_token = source["flow_token"];
	        this.is_token_auth = source["is_token_auth"];
	        this.is_error = source["is_error"];
	        this.error_msg = source["error_msg"];
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.flow_network_parent_uuid = source["flow_network_parent_uuid"];
	        this.flow_ip = source["flow_ip"];
	        this.flow_port = source["flow_port"];
	        this.flow_token_local = source["flow_token_local"];
	        this.streams = this.convertValues(source["streams"], Stream);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Stream {
	    name: string;
	    uuid: string;
	    sync_uuid: string;
	    description?: string;
	    enable?: boolean;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    flow_networks: FlowNetwork[];
	    producers: Producer[];
	    command_groups: CommandGroup[];
	    tags: Tag[];
	    auto_mapping_uuid: string;
	
	    static createFrom(source: any = {}) {
	        return new Stream(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.flow_networks = this.convertValues(source["flow_networks"], FlowNetwork);
	        this.producers = this.convertValues(source["producers"], Producer);
	        this.command_groups = this.convertValues(source["command_groups"], CommandGroup);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.auto_mapping_uuid = source["auto_mapping_uuid"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NetworkMetaTag {
	    network_uuid?: string;
	    key?: string;
	    value?: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkMetaTag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.network_uuid = source["network_uuid"];
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class DeviceMetaTag {
	    device_uuid?: string;
	    key?: string;
	    value?: string;
	
	    static createFrom(source: any = {}) {
	        return new DeviceMetaTag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device_uuid = source["device_uuid"];
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class PointMetaTag {
	    point_uuid?: string;
	    key?: string;
	    value?: string;
	
	    static createFrom(source: any = {}) {
	        return new PointMetaTag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.point_uuid = source["point_uuid"];
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class Priority {
	    point_uuid?: string;
	    _1?: number;
	    _2?: number;
	    _3?: number;
	    _4?: number;
	    _5?: number;
	    _6?: number;
	    _7?: number;
	    _8?: number;
	    _9?: number;
	    _10?: number;
	    _11?: number;
	    _12?: number;
	    _13?: number;
	    _14?: number;
	    _15?: number;
	    _16?: number;
	
	    static createFrom(source: any = {}) {
	        return new Priority(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.point_uuid = source["point_uuid"];
	        this._1 = source["_1"];
	        this._2 = source["_2"];
	        this._3 = source["_3"];
	        this._4 = source["_4"];
	        this._5 = source["_5"];
	        this._6 = source["_6"];
	        this._7 = source["_7"];
	        this._8 = source["_8"];
	        this._9 = source["_9"];
	        this._10 = source["_10"];
	        this._11 = source["_11"];
	        this._12 = source["_12"];
	        this._13 = source["_13"];
	        this._14 = source["_14"];
	        this._15 = source["_15"];
	        this._16 = source["_16"];
	    }
	}
	export class Point {
	    uuid: string;
	    name: string;
	    description?: string;
	    enable?: boolean;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    thing_class?: string;
	    thing_reference?: string;
	    thing_type?: string;
	    fault?: boolean;
	    message_level?: string;
	    message_code?: string;
	    message?: string;
	    // Go type: time.Time
	    last_ok?: any;
	    // Go type: time.Time
	    last_fail?: any;
	    present_value?: number;
	    original_value?: number;
	    write_value?: number;
	    write_value_original?: number;
	    current_priority?: number;
	    write_priority?: number;
	    is_output?: boolean;
	    is_type_bool?: boolean;
	    in_sync?: boolean;
	    fallback?: number;
	    device_uuid?: string;
	    writeable?: boolean;
	    math_on_present_value?: string;
	    math_on_write_value?: string;
	    cov?: number;
	    object_type?: string;
	    object_id?: number;
	    data_type?: string;
	    is_bitwise?: boolean;
	    bitwise_index?: number;
	    object_encoding?: string;
	    io_number?: string;
	    io_type?: string;
	    address_id?: number;
	    address_length?: number;
	    address_uuid?: string;
	    use_next_available_address?: boolean;
	    decimal?: number;
	    multiplication_factor?: number;
	    scale_enable?: boolean;
	    scale_in_min?: number;
	    scale_in_max?: number;
	    scale_out_min?: number;
	    scale_out_max?: number;
	    offset?: number;
	    unit_type?: string;
	    unit?: string;
	    unit_to?: string;
	    is_producer?: boolean;
	    is_consumer?: boolean;
	    priority?: Priority;
	    tags?: Tag[];
	    value_updated_flag?: boolean;
	    point_priority_use_type?: string;
	    write_mode?: string;
	    write_required?: boolean;
	    read_required?: boolean;
	    poll_priority: string;
	    poll_rate: string;
	    bacnet_write_to_pv?: boolean;
	    history_enable?: boolean;
	    history_type?: string;
	    history_interval?: number;
	    history_cov_threshold?: number;
	    meta_tags?: PointMetaTag[];
	    auto_mapping_uuid: string;
	    connection: string;
	
	    static createFrom(source: any = {}) {
	        return new Point(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.thing_class = source["thing_class"];
	        this.thing_reference = source["thing_reference"];
	        this.thing_type = source["thing_type"];
	        this.fault = source["fault"];
	        this.message_level = source["message_level"];
	        this.message_code = source["message_code"];
	        this.message = source["message"];
	        this.last_ok = this.convertValues(source["last_ok"], null);
	        this.last_fail = this.convertValues(source["last_fail"], null);
	        this.present_value = source["present_value"];
	        this.original_value = source["original_value"];
	        this.write_value = source["write_value"];
	        this.write_value_original = source["write_value_original"];
	        this.current_priority = source["current_priority"];
	        this.write_priority = source["write_priority"];
	        this.is_output = source["is_output"];
	        this.is_type_bool = source["is_type_bool"];
	        this.in_sync = source["in_sync"];
	        this.fallback = source["fallback"];
	        this.device_uuid = source["device_uuid"];
	        this.writeable = source["writeable"];
	        this.math_on_present_value = source["math_on_present_value"];
	        this.math_on_write_value = source["math_on_write_value"];
	        this.cov = source["cov"];
	        this.object_type = source["object_type"];
	        this.object_id = source["object_id"];
	        this.data_type = source["data_type"];
	        this.is_bitwise = source["is_bitwise"];
	        this.bitwise_index = source["bitwise_index"];
	        this.object_encoding = source["object_encoding"];
	        this.io_number = source["io_number"];
	        this.io_type = source["io_type"];
	        this.address_id = source["address_id"];
	        this.address_length = source["address_length"];
	        this.address_uuid = source["address_uuid"];
	        this.use_next_available_address = source["use_next_available_address"];
	        this.decimal = source["decimal"];
	        this.multiplication_factor = source["multiplication_factor"];
	        this.scale_enable = source["scale_enable"];
	        this.scale_in_min = source["scale_in_min"];
	        this.scale_in_max = source["scale_in_max"];
	        this.scale_out_min = source["scale_out_min"];
	        this.scale_out_max = source["scale_out_max"];
	        this.offset = source["offset"];
	        this.unit_type = source["unit_type"];
	        this.unit = source["unit"];
	        this.unit_to = source["unit_to"];
	        this.is_producer = source["is_producer"];
	        this.is_consumer = source["is_consumer"];
	        this.priority = this.convertValues(source["priority"], Priority);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.value_updated_flag = source["value_updated_flag"];
	        this.point_priority_use_type = source["point_priority_use_type"];
	        this.write_mode = source["write_mode"];
	        this.write_required = source["write_required"];
	        this.read_required = source["read_required"];
	        this.poll_priority = source["poll_priority"];
	        this.poll_rate = source["poll_rate"];
	        this.bacnet_write_to_pv = source["bacnet_write_to_pv"];
	        this.history_enable = source["history_enable"];
	        this.history_type = source["history_type"];
	        this.history_interval = source["history_interval"];
	        this.history_cov_threshold = source["history_cov_threshold"];
	        this.meta_tags = this.convertValues(source["meta_tags"], PointMetaTag);
	        this.auto_mapping_uuid = source["auto_mapping_uuid"];
	        this.connection = source["connection"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Device {
	    uuid: string;
	    name: string;
	    description?: string;
	    enable?: boolean;
	    fault?: boolean;
	    message_level?: string;
	    message_code?: string;
	    message?: string;
	    // Go type: time.Time
	    last_ok?: any;
	    // Go type: time.Time
	    last_fail?: any;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    thing_class?: string;
	    thing_reference?: string;
	    thing_type?: string;
	    manufacture?: string;
	    model?: string;
	    address_id?: number;
	    zero_mode?: boolean;
	    poll_delay_points_ms: number;
	    address_uuid?: string;
	    host?: string;
	    port?: number;
	    device_mac?: number;
	    device_object_id?: number;
	    network_number?: number;
	    max_adpu?: number;
	    segmentation?: string;
	    device_mask?: number;
	    type_serial?: boolean;
	    transport_type?: string;
	    supports_rpm?: boolean;
	    supports_wpm?: boolean;
	    network_uuid?: string;
	    number_of_devices_permitted?: number;
	    points?: Point[];
	    tags?: Tag[];
	    fast_poll_rate?: number;
	    normal_poll_rate?: number;
	    slow_poll_rate?: number;
	    meta_tags?: DeviceMetaTag[];
	    auto_mapping_uuid: string;
	    connection: string;
	    auto_mapping_enable?: boolean;
	    auto_mapping_flow_network_uuid?: string;
	    auto_mapping_flow_network_name?: string;
	
	    static createFrom(source: any = {}) {
	        return new Device(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.fault = source["fault"];
	        this.message_level = source["message_level"];
	        this.message_code = source["message_code"];
	        this.message = source["message"];
	        this.last_ok = this.convertValues(source["last_ok"], null);
	        this.last_fail = this.convertValues(source["last_fail"], null);
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.thing_class = source["thing_class"];
	        this.thing_reference = source["thing_reference"];
	        this.thing_type = source["thing_type"];
	        this.manufacture = source["manufacture"];
	        this.model = source["model"];
	        this.address_id = source["address_id"];
	        this.zero_mode = source["zero_mode"];
	        this.poll_delay_points_ms = source["poll_delay_points_ms"];
	        this.address_uuid = source["address_uuid"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.device_mac = source["device_mac"];
	        this.device_object_id = source["device_object_id"];
	        this.network_number = source["network_number"];
	        this.max_adpu = source["max_adpu"];
	        this.segmentation = source["segmentation"];
	        this.device_mask = source["device_mask"];
	        this.type_serial = source["type_serial"];
	        this.transport_type = source["transport_type"];
	        this.supports_rpm = source["supports_rpm"];
	        this.supports_wpm = source["supports_wpm"];
	        this.network_uuid = source["network_uuid"];
	        this.number_of_devices_permitted = source["number_of_devices_permitted"];
	        this.points = this.convertValues(source["points"], Point);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.fast_poll_rate = source["fast_poll_rate"];
	        this.normal_poll_rate = source["normal_poll_rate"];
	        this.slow_poll_rate = source["slow_poll_rate"];
	        this.meta_tags = this.convertValues(source["meta_tags"], DeviceMetaTag);
	        this.auto_mapping_uuid = source["auto_mapping_uuid"];
	        this.connection = source["connection"];
	        this.auto_mapping_enable = source["auto_mapping_enable"];
	        this.auto_mapping_flow_network_uuid = source["auto_mapping_flow_network_uuid"];
	        this.auto_mapping_flow_network_name = source["auto_mapping_flow_network_name"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Network {
	    uuid: string;
	    name: string;
	    description?: string;
	    enable?: boolean;
	    fault?: boolean;
	    message_level?: string;
	    message_code?: string;
	    message?: string;
	    // Go type: time.Time
	    last_ok?: any;
	    // Go type: time.Time
	    last_fail?: any;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    manufacture?: string;
	    model?: string;
	    writeable_network?: boolean;
	    thing_class?: string;
	    thing_reference?: string;
	    thing_type?: string;
	    transport_type?: string;
	    plugin_conf_id?: string;
	    plugin_name?: string;
	    number_of_networks_permitted?: number;
	    network_interface: string;
	    ip: string;
	    port?: number;
	    network_mask?: number;
	    address_id: string;
	    address_uuid: string;
	    serial_port?: string;
	    serial_baud_rate?: number;
	    serial_stop_bits?: number;
	    serial_parity?: string;
	    serial_data_bits?: number;
	    serial_timeout?: number;
	    serial_connected?: boolean;
	    host?: string;
	    devices?: Device[];
	    tags?: Tag[];
	    max_poll_rate?: number;
	    meta_tags?: NetworkMetaTag[];
	    auto_mapping_enable?: boolean;
	    auto_mapping_flow_network_uuid?: string;
	    auto_mapping_flow_network_name?: string;
	    auto_mapping_uuid: string;
	
	    static createFrom(source: any = {}) {
	        return new Network(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.fault = source["fault"];
	        this.message_level = source["message_level"];
	        this.message_code = source["message_code"];
	        this.message = source["message"];
	        this.last_ok = this.convertValues(source["last_ok"], null);
	        this.last_fail = this.convertValues(source["last_fail"], null);
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.manufacture = source["manufacture"];
	        this.model = source["model"];
	        this.writeable_network = source["writeable_network"];
	        this.thing_class = source["thing_class"];
	        this.thing_reference = source["thing_reference"];
	        this.thing_type = source["thing_type"];
	        this.transport_type = source["transport_type"];
	        this.plugin_conf_id = source["plugin_conf_id"];
	        this.plugin_name = source["plugin_name"];
	        this.number_of_networks_permitted = source["number_of_networks_permitted"];
	        this.network_interface = source["network_interface"];
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.network_mask = source["network_mask"];
	        this.address_id = source["address_id"];
	        this.address_uuid = source["address_uuid"];
	        this.serial_port = source["serial_port"];
	        this.serial_baud_rate = source["serial_baud_rate"];
	        this.serial_stop_bits = source["serial_stop_bits"];
	        this.serial_parity = source["serial_parity"];
	        this.serial_data_bits = source["serial_data_bits"];
	        this.serial_timeout = source["serial_timeout"];
	        this.serial_connected = source["serial_connected"];
	        this.host = source["host"];
	        this.devices = this.convertValues(source["devices"], Device);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.max_poll_rate = source["max_poll_rate"];
	        this.meta_tags = this.convertValues(source["meta_tags"], NetworkMetaTag);
	        this.auto_mapping_enable = source["auto_mapping_enable"];
	        this.auto_mapping_flow_network_uuid = source["auto_mapping_flow_network_uuid"];
	        this.auto_mapping_flow_network_name = source["auto_mapping_flow_network_name"];
	        this.auto_mapping_uuid = source["auto_mapping_uuid"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Tag {
	    tag: string;
	    networks?: Network[];
	    devices?: Device[];
	    points?: Point[];
	    streams?: Stream[];
	    stream_clones?: StreamClone[];
	    producers?: Producer[];
	    consumers?: Consumer[];
	
	    static createFrom(source: any = {}) {
	        return new Tag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tag = source["tag"];
	        this.networks = this.convertValues(source["networks"], Network);
	        this.devices = this.convertValues(source["devices"], Device);
	        this.points = this.convertValues(source["points"], Point);
	        this.streams = this.convertValues(source["streams"], Stream);
	        this.stream_clones = this.convertValues(source["stream_clones"], StreamClone);
	        this.producers = this.convertValues(source["producers"], Producer);
	        this.consumers = this.convertValues(source["consumers"], Consumer);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConsumerHistory {
	    uuid: string;
	    consumer_uuid: string;
	    producer_uuid: string;
	    data_store: number[];
	    // Go type: time.Time
	    timestamp: any;
	
	    static createFrom(source: any = {}) {
	        return new ConsumerHistory(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.consumer_uuid = source["consumer_uuid"];
	        this.producer_uuid = source["producer_uuid"];
	        this.data_store = source["data_store"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Writer {
	    uuid: string;
	    sync_uuid: string;
	    writer_thing_class?: string;
	    writer_thing_type?: string;
	    writer_thing_uuid?: string;
	    writer_thing_name?: string;
	    data_store?: number[];
	    connection: string;
	    message: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    consumer_uuid?: string;
	    present_value?: number;
	
	    static createFrom(source: any = {}) {
	        return new Writer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.writer_thing_class = source["writer_thing_class"];
	        this.writer_thing_type = source["writer_thing_type"];
	        this.writer_thing_uuid = source["writer_thing_uuid"];
	        this.writer_thing_name = source["writer_thing_name"];
	        this.data_store = source["data_store"];
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.consumer_uuid = source["consumer_uuid"];
	        this.present_value = source["present_value"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Consumer {
	    uuid: string;
	    name: string;
	    description?: string;
	    enable?: boolean;
	    sync_uuid: string;
	    producer_uuid?: string;
	    producer_thing_name?: string;
	    producer_thing_uuid?: string;
	    producer_thing_class?: string;
	    producer_thing_type?: string;
	    producer_thing_ref?: string;
	    consumer_application?: string;
	    current_writer_uuid?: string;
	    stream_clone_uuid?: string;
	    data_store?: number[];
	    writers?: Writer[];
	    consumer_histories?: ConsumerHistory[];
	    tags?: Tag[];
	    connection: string;
	    message: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	
	    static createFrom(source: any = {}) {
	        return new Consumer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.sync_uuid = source["sync_uuid"];
	        this.producer_uuid = source["producer_uuid"];
	        this.producer_thing_name = source["producer_thing_name"];
	        this.producer_thing_uuid = source["producer_thing_uuid"];
	        this.producer_thing_class = source["producer_thing_class"];
	        this.producer_thing_type = source["producer_thing_type"];
	        this.producer_thing_ref = source["producer_thing_ref"];
	        this.consumer_application = source["consumer_application"];
	        this.current_writer_uuid = source["current_writer_uuid"];
	        this.stream_clone_uuid = source["stream_clone_uuid"];
	        this.data_store = source["data_store"];
	        this.writers = this.convertValues(source["writers"], Writer);
	        this.consumer_histories = this.convertValues(source["consumer_histories"], ConsumerHistory);
	        this.tags = this.convertValues(source["tags"], Tag);
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class FlowNetworkClone {
	    uuid: string;
	    sync_uuid: string;
	    name: string;
	    description?: string;
	    global_uuid?: string;
	    client_id?: string;
	    client_name?: string;
	    site_id?: string;
	    site_name?: string;
	    device_id?: string;
	    device_name?: string;
	    is_remote?: boolean;
	    fetch_histories?: boolean;
	    fetch_hist_frequency?: number;
	    delete_histories_on_fetch?: boolean;
	    is_master_slave?: boolean;
	    flow_https?: boolean;
	    flow_username?: string;
	    flow_password?: string;
	    flow_token?: string;
	    is_token_auth?: boolean;
	    is_error?: boolean;
	    error_msg?: string;
	    connection: string;
	    message: string;
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	    source_uuid: string;
	    flow_ip?: string;
	    flow_port?: number;
	    stream_clones: StreamClone[];
	
	    static createFrom(source: any = {}) {
	        return new FlowNetworkClone(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.sync_uuid = source["sync_uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.global_uuid = source["global_uuid"];
	        this.client_id = source["client_id"];
	        this.client_name = source["client_name"];
	        this.site_id = source["site_id"];
	        this.site_name = source["site_name"];
	        this.device_id = source["device_id"];
	        this.device_name = source["device_name"];
	        this.is_remote = source["is_remote"];
	        this.fetch_histories = source["fetch_histories"];
	        this.fetch_hist_frequency = source["fetch_hist_frequency"];
	        this.delete_histories_on_fetch = source["delete_histories_on_fetch"];
	        this.is_master_slave = source["is_master_slave"];
	        this.flow_https = source["flow_https"];
	        this.flow_username = source["flow_username"];
	        this.flow_password = source["flow_password"];
	        this.flow_token = source["flow_token"];
	        this.is_token_auth = source["is_token_auth"];
	        this.is_error = source["is_error"];
	        this.error_msg = source["error_msg"];
	        this.connection = source["connection"];
	        this.message = source["message"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	        this.source_uuid = source["source_uuid"];
	        this.flow_ip = source["flow_ip"];
	        this.flow_port = source["flow_port"];
	        this.stream_clones = this.convertValues(source["stream_clones"], StreamClone);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class LocalStorageFlowNetwork {
	    flow_ip?: string;
	    flow_port?: number;
	    flow_https?: boolean;
	    flow_username?: string;
	    flow_password?: string;
	    flow_token?: string;
	
	    static createFrom(source: any = {}) {
	        return new LocalStorageFlowNetwork(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.flow_ip = source["flow_ip"];
	        this.flow_port = source["flow_port"];
	        this.flow_https = source["flow_https"];
	        this.flow_username = source["flow_username"];
	        this.flow_password = source["flow_password"];
	        this.flow_token = source["flow_token"];
	    }
	}
	
	
	
	
	export class Schedule {
	    uuid: string;
	    name: string;
	    enable?: boolean;
	    thing_class?: string;
	    thing_type?: string;
	    is_active?: boolean;
	    is_global?: boolean;
	    schedule: number[];
	    // Go type: time.Time
	    created_on?: any;
	    // Go type: time.Time
	    updated_on?: any;
	
	    static createFrom(source: any = {}) {
	        return new Schedule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.enable = source["enable"];
	        this.thing_class = source["thing_class"];
	        this.thing_type = source["thing_type"];
	        this.is_active = source["is_active"];
	        this.is_global = source["is_global"];
	        this.schedule = source["schedule"];
	        this.created_on = this.convertValues(source["created_on"], null);
	        this.updated_on = this.convertValues(source["updated_on"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class TokenResponse {
	    access_token: string;
	    token_type: string;
	
	    static createFrom(source: any = {}) {
	        return new TokenResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.access_token = source["access_token"];
	        this.token_type = source["token_type"];
	    }
	}
	

}

export namespace networking {
	
	export class InterfaceNames {
	    interface_names: string[];
	
	    static createFrom(source: any = {}) {
	        return new InterfaceNames(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.interface_names = source["interface_names"];
	    }
	}
	export class NetworkInterfaces {
	    interface: string;
	    ip: string;
	    ip_and_mask: string;
	    netmask: string;
	    net_mask_length: number;
	    gateway: string;
	    mac_address: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkInterfaces(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.interface = source["interface"];
	        this.ip = source["ip"];
	        this.ip_and_mask = source["ip_and_mask"];
	        this.netmask = source["netmask"];
	        this.net_mask_length = source["net_mask_length"];
	        this.gateway = source["gateway"];
	        this.mac_address = source["mac_address"];
	    }
	}

}

export namespace node {
	
	export class OutputConnection {
	    overrideValue?: any;
	    currentValue?: any;
	    fallbackValue?: any;
	    disable?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new OutputConnection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.overrideValue = source["overrideValue"];
	        this.currentValue = source["currentValue"];
	        this.fallbackValue = source["fallbackValue"];
	        this.disable = source["disable"];
	    }
	}
	export class Output {
	    name: string;
	    type: string;
	    connections?: OutputConnection[];
	    help: string;
	    folderExport: boolean;
	    hideOutput: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Output(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.connections = this.convertValues(source["connections"], OutputConnection);
	        this.help = source["help"];
	        this.folderExport = source["folderExport"];
	        this.hideOutput = source["hideOutput"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InputConnection {
	    nodeID?: string;
	    nodePort?: string;
	    overrideValue?: any;
	    currentValue?: any;
	    fallbackValue?: any;
	    disable?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new InputConnection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nodeID = source["nodeID"];
	        this.nodePort = source["nodePort"];
	        this.overrideValue = source["overrideValue"];
	        this.currentValue = source["currentValue"];
	        this.fallbackValue = source["fallbackValue"];
	        this.disable = source["disable"];
	    }
	}
	export class Input {
	    name: string;
	    type: string;
	    // Go type: InputConnection
	    link?: any;
	    help: string;
	    folderExport: boolean;
	    hideInput: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Input(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.link = this.convertValues(source["link"], null);
	        this.help = source["help"];
	        this.folderExport = source["folderExport"];
	        this.hideInput = source["hideInput"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Info {
	    nodeID: string;
	    name?: string;
	    nodeName?: string;
	    category?: string;
	    type?: string;
	    icon?: string;
	    description?: string;
	    version?: string;
	    display?: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nodeID = source["nodeID"];
	        this.name = source["name"];
	        this.nodeName = source["nodeName"];
	        this.category = source["category"];
	        this.type = source["type"];
	        this.icon = source["icon"];
	        this.description = source["description"];
	        this.version = source["version"];
	        this.display = source["display"];
	    }
	}
	export class Help {
	    name: string;
	    help: string;
	    info?: Info;
	    allowPayload: boolean;
	    payloadType: string;
	    inputs?: Input[];
	    outputs?: Output[];
	    settings?: schemas.Schema;
	
	    static createFrom(source: any = {}) {
	        return new Help(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.help = source["help"];
	        this.info = this.convertValues(source["info"], Info);
	        this.allowPayload = source["allowPayload"];
	        this.payloadType = source["payloadType"];
	        this.inputs = this.convertValues(source["inputs"], Input);
	        this.outputs = this.convertValues(source["outputs"], Output);
	        this.settings = this.convertValues(source["settings"], schemas.Schema);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Metadata {
	    positionX?: string;
	    positionY?: string;
	    dynamicInputs: boolean;
	    dynamicOutputs: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Metadata(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.positionX = source["positionX"];
	        this.positionY = source["positionY"];
	        this.dynamicInputs = source["dynamicInputs"];
	        this.dynamicOutputs = source["dynamicOutputs"];
	    }
	}
	export class Status {
	    subTitle?: string;
	    activeMessage?: boolean;
	    message?: string;
	    errorMessage?: string;
	    errorIcon?: string;
	    waringMessage?: string;
	    waringIcon?: string;
	    notifyMessage?: string;
	    notifyIcon?: string;
	
	    static createFrom(source: any = {}) {
	        return new Status(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.subTitle = source["subTitle"];
	        this.activeMessage = source["activeMessage"];
	        this.message = source["message"];
	        this.errorMessage = source["errorMessage"];
	        this.errorIcon = source["errorIcon"];
	        this.waringMessage = source["waringMessage"];
	        this.waringIcon = source["waringIcon"];
	        this.notifyMessage = source["notifyMessage"];
	        this.notifyIcon = source["notifyIcon"];
	    }
	}
	export class nodeValue {
	    pin: string;
	    dataType: string;
	    value: any;
	
	    static createFrom(source: any = {}) {
	        return new nodeValue(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pin = source["pin"];
	        this.dataType = source["dataType"];
	        this.value = source["value"];
	    }
	}
	export class Values {
	    name: string;
	    nodeId: string;
	    settings?: {[key: string]: any};
	    outputs: nodeValue[];
	    inputs: nodeValue[];
	    status?: Status;
	
	    static createFrom(source: any = {}) {
	        return new Values(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.nodeId = source["nodeId"];
	        this.settings = source["settings"];
	        this.outputs = this.convertValues(source["outputs"], nodeValue);
	        this.inputs = this.convertValues(source["inputs"], nodeValue);
	        this.status = this.convertValues(source["status"], Status);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace nodes {
	
	export class PalletOutputs {
	    name: string;
	    valueType: string;
	    folderExport: boolean;
	    hideOutput: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PalletOutputs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.valueType = source["valueType"];
	        this.folderExport = source["folderExport"];
	        this.hideOutput = source["hideOutput"];
	    }
	}
	export class PalletInputs {
	    name: string;
	    valueType: string;
	    defaultValue?: any;
	    folderExport: boolean;
	    hideInput: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PalletInputs(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.valueType = source["valueType"];
	        this.defaultValue = source["defaultValue"];
	        this.folderExport = source["folderExport"];
	        this.hideInput = source["hideInput"];
	    }
	}
	export class PalletNode {
	    type: string;
	    category: string;
	    isParent: boolean;
	    allowSettings: boolean;
	    inputs: PalletInputs[];
	    outputs: PalletOutputs[];
	    info: node.Info;
	    metadata?: node.Metadata;
	    payloadType: string;
	    allowPayload: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PalletNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.category = source["category"];
	        this.isParent = source["isParent"];
	        this.allowSettings = source["allowSettings"];
	        this.inputs = this.convertValues(source["inputs"], PalletInputs);
	        this.outputs = this.convertValues(source["outputs"], PalletOutputs);
	        this.info = this.convertValues(source["info"], node.Info);
	        this.metadata = this.convertValues(source["metadata"], node.Metadata);
	        this.payloadType = source["payloadType"];
	        this.allowPayload = source["allowPayload"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace rumodel {
	
	export class AppsAvailableForInstall {
	    app_name?: string;
	    min_version?: string;
	    max_version?: string;
	
	    static createFrom(source: any = {}) {
	        return new AppsAvailableForInstall(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_name = source["app_name"];
	        this.min_version = source["min_version"];
	        this.max_version = source["max_version"];
	    }
	}
	export class InstalledApps {
	    app_name?: string;
	    version?: string;
	    min_version?: string;
	    max_version?: string;
	    service_name?: string;
	    is_installed: boolean;
	    message?: string;
	    match?: boolean;
	    downgrade_required?: boolean;
	    upgrade_required?: boolean;
	    state?: string;
	    active_state?: string;
	    sub_state?: string;
	
	    static createFrom(source: any = {}) {
	        return new InstalledApps(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app_name = source["app_name"];
	        this.version = source["version"];
	        this.min_version = source["min_version"];
	        this.max_version = source["max_version"];
	        this.service_name = source["service_name"];
	        this.is_installed = source["is_installed"];
	        this.message = source["message"];
	        this.match = source["match"];
	        this.downgrade_required = source["downgrade_required"];
	        this.upgrade_required = source["upgrade_required"];
	        this.state = source["state"];
	        this.active_state = source["active_state"];
	        this.sub_state = source["sub_state"];
	    }
	}
	export class EdgeAppsInfo {
	    installed_apps?: InstalledApps[];
	    apps_available_for_install?: AppsAvailableForInstall[];
	
	    static createFrom(source: any = {}) {
	        return new EdgeAppsInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed_apps = this.convertValues(source["installed_apps"], InstalledApps);
	        this.apps_available_for_install = this.convertValues(source["apps_available_for_install"], AppsAvailableForInstall);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Response {
	    code: number;
	    msg?: string;
	    data: any;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.msg = source["msg"];
	        this.data = source["data"];
	    }
	}

}

export namespace schema {
	
	export class Description {
	    type: string;
	    title: string;
	
	    static createFrom(source: any = {}) {
	        return new Description(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	    }
	}
	export class Enable {
	    type: string;
	    title: string;
	    default: boolean;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Enable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.default = source["default"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class HTTPS {
	    type: string;
	    title: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new HTTPS(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class Host {
	    type: string;
	    title: string;
	    default: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Host(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.default = source["default"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class Name {
	    type: string;
	    title: string;
	    minLength: number;
	    maxLength: number;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Name(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.minLength = source["minLength"];
	        this.maxLength = source["maxLength"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class Port {
	    type: string;
	    title: string;
	    minLength: number;
	    maxLength: number;
	    default: number;
	    help: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Port(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.minLength = source["minLength"];
	        this.maxLength = source["maxLength"];
	        this.default = source["default"];
	        this.help = source["help"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class Token {
	    type: string;
	    title: string;
	    minLength: number;
	    maxLength: number;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Token(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.minLength = source["minLength"];
	        this.maxLength = source["maxLength"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class UUID {
	    type: string;
	    title: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UUID(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.readOnly = source["readOnly"];
	    }
	}

}

export namespace schemas {
	
	export class SchemaBody {
	    title: string;
	    properties: any;
	
	    static createFrom(source: any = {}) {
	        return new SchemaBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.properties = source["properties"];
	    }
	}
	export class Schema {
	    schema: SchemaBody;
	    uiSchema: any;
	
	    static createFrom(source: any = {}) {
	        return new Schema(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.schema = this.convertValues(source["schema"], SchemaBody);
	        this.uiSchema = source["uiSchema"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace storage {
	
	export class Backup {
	    uuid: string;
	    connection_uuid: string;
	    connection_name: string;
	    user_comment: string;
	    host_uuid: string;
	    host_name: string;
	    backup_info: string;
	    // Go type: time.Time
	    time: any;
	    timestamp: string;
	    application: string;
	    sub_application: string;
	    data?: any;
	
	    static createFrom(source: any = {}) {
	        return new Backup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.connection_uuid = source["connection_uuid"];
	        this.connection_name = source["connection_name"];
	        this.user_comment = source["user_comment"];
	        this.host_uuid = source["host_uuid"];
	        this.host_name = source["host_name"];
	        this.backup_info = source["backup_info"];
	        this.time = this.convertValues(source["time"], null);
	        this.timestamp = source["timestamp"];
	        this.application = source["application"];
	        this.sub_application = source["sub_application"];
	        this.data = source["data"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RubixConnection {
	    uuid: string;
	    name: string;
	    description: string;
	    enable: boolean;
	    ip: string;
	    port: number;
	    https: boolean;
	    external_token: string;
	
	    static createFrom(source: any = {}) {
	        return new RubixConnection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.enable = source["enable"];
	        this.ip = source["ip"];
	        this.port = source["port"];
	        this.https = source["https"];
	        this.external_token = source["external_token"];
	    }
	}
	export class Settings {
	    uuid: string;
	    theme: string;
	    git_token: string;
	    auto_refresh_enable: boolean;
	    auto_refresh_rate: number;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.theme = source["theme"];
	        this.git_token = source["git_token"];
	        this.auto_refresh_enable = source["auto_refresh_enable"];
	        this.auto_refresh_rate = source["auto_refresh_rate"];
	    }
	}

}

export namespace store {
	
	export class Apps {
	    name: string;
	    repo: string;
	    description: string;
	    port?: number;
	    transport: string;
	    exec_start: string;
	    attach_working_dir_on_exec_start: boolean;
	    environment_vars: string[];
	    products: string[];
	    arch: string[];
	    min_version?: string;
	    max_version: string;
	    flow_dependency: boolean;
	    plugin_dependency: string[];
	    service_dependency: string[];
	    is_zipball: boolean;
	    do_not_validate_arch: boolean;
	    move_extracted_file_to_name_app: boolean;
	    move_one_level_inside_file_to_outside: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Apps(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.repo = source["repo"];
	        this.description = source["description"];
	        this.port = source["port"];
	        this.transport = source["transport"];
	        this.exec_start = source["exec_start"];
	        this.attach_working_dir_on_exec_start = source["attach_working_dir_on_exec_start"];
	        this.environment_vars = source["environment_vars"];
	        this.products = source["products"];
	        this.arch = source["arch"];
	        this.min_version = source["min_version"];
	        this.max_version = source["max_version"];
	        this.flow_dependency = source["flow_dependency"];
	        this.plugin_dependency = source["plugin_dependency"];
	        this.service_dependency = source["service_dependency"];
	        this.is_zipball = source["is_zipball"];
	        this.do_not_validate_arch = source["do_not_validate_arch"];
	        this.move_extracted_file_to_name_app = source["move_extracted_file_to_name_app"];
	        this.move_one_level_inside_file_to_outside = source["move_one_level_inside_file_to_outside"];
	    }
	}
	
	export class Plugins {
	    name: string;
	    plugin: string;
	    description: string;
	    products: string[];
	    arch: string[];
	    app_dependency: string[];
	    plugin_dependency: string[];
	    service_dependency: string[];
	    port?: number;
	    transport?: string;
	
	    static createFrom(source: any = {}) {
	        return new Plugins(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.plugin = source["plugin"];
	        this.description = source["description"];
	        this.products = source["products"];
	        this.arch = source["arch"];
	        this.app_dependency = source["app_dependency"];
	        this.plugin_dependency = source["plugin_dependency"];
	        this.service_dependency = source["service_dependency"];
	        this.port = source["port"];
	        this.transport = source["transport"];
	    }
	}
	export class Services {
	    name: string;
	    service_name: string;
	    description: string;
	    port: number;
	    transport: string;
	    products: string[];
	    arch: string[];
	
	    static createFrom(source: any = {}) {
	        return new Services(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.service_name = source["service_name"];
	        this.description = source["description"];
	        this.port = source["port"];
	        this.transport = source["transport"];
	        this.products = source["products"];
	        this.arch = source["arch"];
	    }
	}
	export class Release {
	    uuid: string;
	    release: string;
	    apps: Apps[];
	    plugins: Plugins[];
	    services: Services[];
	
	    static createFrom(source: any = {}) {
	        return new Release(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.release = source["release"];
	        this.apps = this.convertValues(source["apps"], Apps);
	        this.plugins = this.convertValues(source["plugins"], Plugins);
	        this.services = this.convertValues(source["services"], Services);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ReleaseList {
	    name: string;
	    path: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new ReleaseList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.url = source["url"];
	    }
	}

}

export namespace system {
	
	export class DHCPPortExists {
	    is_dhcp: boolean;
	    interface_exists: boolean;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new DHCPPortExists(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.is_dhcp = source["is_dhcp"];
	        this.interface_exists = source["interface_exists"];
	        this.error = source["error"];
	    }
	}
	export class Message {
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
	export class NetworkingBody {
	    port_name: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkingBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port_name = source["port_name"];
	    }
	}
	export class UFWBody {
	    port: number;
	
	    static createFrom(source: any = {}) {
	        return new UFWBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	    }
	}

}

export namespace ufw {
	
	export class Message {
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	    }
	}
	export class UFWStatus {
	    port: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new UFWStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	        this.status = source["status"];
	    }
	}

}

