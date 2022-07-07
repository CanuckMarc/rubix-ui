// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {model} from '../models';
import {assistmodel} from '../models';
import {main} from '../models';
import {networking} from '../models';
import {storage} from '../models';
import {assitcli} from '../models';
import {edge} from '../models';
import {datelib} from '../models';

export function DeleteBackup(arg1:string):Promise<string>;

export function EditDevice(arg1:string,arg2:string,arg3:string,arg4:model.Device):Promise<model.Device>;

export function EditHostNetwork(arg1:string,arg2:string,arg3:assistmodel.Network):Promise<assistmodel.Network>;

export function GetConnectionSchema():Promise<main.ConnectionSchema>;

export function GetFlowNetworkSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetHost(arg1:string,arg2:string):Promise<assistmodel.Host>;

export function GetHostSchema(arg1:string):Promise<any>;

export function UpdateLocation(arg1:string,arg2:string,arg3:assistmodel.Location):Promise<assistmodel.Location>;

export function AddNetwork(arg1:string,arg2:string,arg3:model.Network):Promise<model.Network>;

export function EditNetwork(arg1:string,arg2:string,arg3:string,arg4:model.Network):Promise<model.Network>;

export function GetDevices(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.Device>>;

export function GetNetworks(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.Network>>;

export function GetPcGetNetworks():Promise<any>;

export function GetPcInterfaces():Promise<networking.InterfaceNames>;

export function GetPlugins(arg1:string,arg2:string):Promise<Array<model.PluginConf>>;

export function GetBackupsByApplication(arg1:string,arg2:boolean):Promise<Array<storage.Backup>>;

export function GetConnection(arg1:string):Promise<storage.RubixConnection>;

export function HostRubixScan(arg1:string,arg2:string):Promise<any>;

export function AddHost(arg1:string,arg2:assistmodel.Host):Promise<assistmodel.Host>;

export function DeleteAllConnections():Promise<main.DeleteAllConnections>;

export function DisablePluginBulk(arg1:string,arg2:string,arg3:Array<main.PluginUUIDs>):Promise<any>;

export function EnablePluginBulk(arg1:string,arg2:string,arg3:Array<main.PluginUUIDs>):Promise<any>;

export function GetBackupsNoData():Promise<Array<storage.Backup>>;

export function GetLocations(arg1:string):Promise<Array<assistmodel.Location>>;

export function UpdateConnection(arg1:string,arg2:storage.RubixConnection):Promise<storage.RubixConnection>;

export function GetHostActiveNetworks(arg1:string,arg2:string):Promise<any>;

export function GetLocationSchema(arg1:string):Promise<any>;

export function GetNetwork(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Network>;

export function DeleteLocation(arg1:string,arg2:string):Promise<assitcli.Response>;

export function EnablePlugin(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetHostInterfaces(arg1:string,arg2:string):Promise<edge.InterfaceNames>;

export function AddConnection(arg1:storage.RubixConnection):Promise<storage.RubixConnection>;

export function DeleteDevice(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DisablePlugin(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetLocationTableSchema(arg1:string):Promise<any>;

export function GetPcTime():Promise<datelib.Time>;

export function GetPoint(arg1:string,arg2:string,arg3:string):Promise<model.Point>;

export function BacnetWhois(arg1:string,arg2:string,arg3:string):Promise<model.Device>;

export function GetFlowDeviceSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetPcGetNetworksSchema():Promise<any>;

export function PingHost(arg1:string,arg2:string):Promise<boolean>;

export function DeleteNetwork(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DeleteNetworkBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function GetHosts(arg1:string):Promise<Array<assistmodel.Host>>;

export function GetServerNetworking(arg1:string):Promise<any>;

export function DeleteHost(arg1:string,arg2:string):Promise<assitcli.Response>;

export function DeleteHostNetwork(arg1:string,arg2:string):Promise<assitcli.Response>;

export function GetBackups():Promise<Array<storage.Backup>>;

export function GetHostInternetIP(arg1:string,arg2:string):Promise<edge.InternetIP>;

export function GetHostNetwork(arg1:string,arg2:string):Promise<assistmodel.Network>;

export function GetNetworkByPluginName(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Network>;

export function GetNetworksWithPoints(arg1:string,arg2:string):Promise<model.Network>;

export function GetPoints(arg1:string,arg2:string):Promise<Array<model.Point>>;

export function WiresBackupRestore(arg1:string,arg2:string,arg3:string):Promise<any>;

export function AddDevice(arg1:string,arg2:string,arg3:model.Device):Promise<model.Device>;

export function AddHostNetwork(arg1:string,arg2:assistmodel.Network):Promise<assistmodel.Network>;

export function AddPoint(arg1:string,arg2:string,arg3:model.Point):Promise<model.Point>;

export function GetDevice(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Device>;

export function DeletePointBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EditPoint(arg1:string,arg2:string,arg3:string,arg4:model.Point):Promise<model.Point>;

export function GetLogsByConnection(arg1:string):Promise<any>;

export function GetServerTime(arg1:string):Promise<any>;

export function WiresBackup(arg1:string,arg2:string):Promise<storage.Backup>;

export function DeleteDeviceBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EditHost(arg1:string,arg2:string,arg3:assistmodel.Host):Promise<assistmodel.Host>;

export function GetConnections():Promise<Array<storage.RubixConnection>>;

export function GetFlowPointSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetHostTime(arg1:string,arg2:string):Promise<any>;

export function GetNetworkSchema(arg1:string):Promise<any>;

export function GetPlugin(arg1:string,arg2:string,arg3:string):Promise<model.PluginConf>;

export function GetPluginsNames(arg1:string,arg2:string):Promise<Array<main.PluginName>>;

export function OpenURL(arg1:string):void;

export function GetLogs():Promise<any>;

export function GetPluginByName(arg1:string,arg2:string,arg3:string):Promise<model.PluginConf|Error>;

export function GetPointsForDevice(arg1:string,arg2:string,arg3:string):Promise<Array<model.Point>>;

export function GetLocation(arg1:string,arg2:string):Promise<assistmodel.Location>;

export function GetNetworkDevices(arg1:string,arg2:string,arg3:string):Promise<Array<model.Device>>;

export function Scanner(arg1:string,arg2:string,arg3:number,arg4:Array<string>):Promise<any>;

export function AddLocation(arg1:string,arg2:assistmodel.Location):Promise<assistmodel.Location>;

export function DeleteConnection(arg1:string):Promise<string>;

export function DeletePoint(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetBackup(arg1:string):Promise<storage.Backup>;

export function GetHostNetworks(arg1:string):Promise<Array<assistmodel.Network>>;

export function GetLogsWithData():Promise<any>;

export function GetScannerSchema():Promise<any>;

export function PingRubixAssist(arg1:string):Promise<boolean>;
