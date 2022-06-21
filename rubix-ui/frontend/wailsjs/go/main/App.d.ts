// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {model} from '../models';
import {main} from '../models';
import {storage} from '../models';
import {assitcli} from '../models';
import {networking} from '../models';
import {edge} from '../models';

export function GetLocationSchema(arg1:string):Promise<any>;

export function GetLocationTableSchema(arg1:string):Promise<any>;

export function GetLocations(arg1:string):Promise<Array<model.Location>>;

export function GetLogsWithData():Promise<any>;

export function DeleteAllConnections():Promise<main.DeleteAllConnections>;

export function GetHostActiveNetworks(arg1:string,arg2:string):Promise<any>;

export function GetHostNetwork(arg1:string,arg2:string):Promise<model.Network>;

export function GetLocation(arg1:string,arg2:string):Promise<model.Location>;

export function GetLogsByConnection(arg1:string):Promise<any>;

export function GetNetworkSchema(arg1:string):Promise<any>;

export function PingHost(arg1:string,arg2:string):Promise<boolean>;

export function UpdateConnection(arg1:string,arg2:storage.RubixConnection):Promise<storage.RubixConnection>;

export function AddConnection(arg1:storage.RubixConnection):Promise<storage.RubixConnection>;

export function AddHostNetwork(arg1:string,arg2:model.Network):Promise<model.Network>;

export function DeleteHostNetwork(arg1:string,arg2:string):Promise<assitcli.Response>;

export function DeleteConnection(arg1:string):Promise<string>;

export function GetConnections():Promise<Array<storage.RubixConnection>>;

export function HostRubixScan(arg1:string,arg2:string):Promise<any>;

export function UpdateLocation(arg1:string,arg2:string,arg3:model.Location):Promise<model.Location>;

export function GetPcInterfaces():Promise<networking.InterfaceNames>;

export function GetServerNetworking(arg1:string):Promise<any>;

export function GetServerTime(arg1:string):Promise<any>;

export function PingRubixAssist(arg1:string):Promise<boolean>;

export function AddLocation(arg1:string,arg2:model.Location):Promise<model.Location>;

export function EditHost(arg1:string,arg2:string,arg3:model.Host):Promise<model.Host>;

export function GetHostSchema(arg1:string):Promise<any>;

export function DeleteHost(arg1:string,arg2:string):Promise<assitcli.Response>;

export function GetHostInterfaces(arg1:string,arg2:string):Promise<edge.InterfaceNames>;

export function GetLogs():Promise<any>;

export function GetHost(arg1:string,arg2:string):Promise<model.Host>;

export function GetHostInternetIP(arg1:string,arg2:string):Promise<edge.InternetIP>;

export function GetHostTime(arg1:string,arg2:string):Promise<any>;

export function GetHosts(arg1:string):Promise<Array<model.Host>>;

export function AddHost(arg1:string,arg2:model.Host):Promise<model.Host>;

export function DeleteLocation(arg1:string,arg2:string):Promise<assitcli.Response>;

export function GetConnection(arg1:string):Promise<storage.RubixConnection>;

export function EditHostNetwork(arg1:string,arg2:string,arg3:model.Network):Promise<model.Network>;

export function GetConnectionSchema():Promise<main.ConnectionSchema>;

export function GetHostNetworks(arg1:string):Promise<Array<model.Network>>;
