// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {store} from '../models';
import {storage} from '../models';
import {model} from '../models';
import {flowcli} from '../models';
import {networking} from '../models';
import {main} from '../models';
import {assistmodel} from '../models';
import {nodes} from '../models';
import {installer} from '../models';
import {assitcli} from '../models';
import {systemd} from '../models';
import {node} from '../models';
import {system} from '../models';
import {appstore} from '../models';
import {flow} from '../models';
import {datelib} from '../models';
import {dhcpd} from '../models';

export function AddRelease(arg1:string,arg2:string):Promise<store.Release>;

export function GetBackup(arg1:string):Promise<storage.Backup>;

export function GetFlowNetwork(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.FlowNetwork>;

export function GetGitToken(arg1:string,arg2:boolean):Promise<string>;

export function ImportBackup(arg1:storage.Backup):Promise<string>;

export function NodeSchema(arg1:string):Promise<flowcli.Schema>;

export function AddFlowNetwork(arg1:string,arg2:string,arg3:model.FlowNetwork):Promise<model.FlowNetwork>;

export function DeletePoint(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetLocationSchema(arg1:string):Promise<any>;

export function GetPcGetNetworks():Promise<any>;

export function GetPcInterfaces():Promise<networking.InterfaceNames>;

export function GetRcNetworkSchema(arg1:string,arg2:string):Promise<any>;

export function GetReleaseByVersion(arg1:string):Promise<store.Release>;

export function DeleteAllConnections():Promise<main.DeleteAllConnections>;

export function DeleteConsumerBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function GetHostNetwork(arg1:string,arg2:string):Promise<assistmodel.Network>;

export function NodePallet():Promise<Array<nodes.PalletNode>>;

export function GetProducers(arg1:string,arg2:string):Promise<Array<model.Producer>>;

export function AddNetwork(arg1:string,arg2:string,arg3:model.Network):Promise<model.Network>;

export function DeleteHostNetworkBulk(arg1:string,arg2:Array<main.UUIDs>):Promise<any>;

export function DeleteWritersBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EdgeDeleteAllPlugins(arg1:string,arg2:string):Promise<model.Message>;

export function EdgeServiceRestart(arg1:string,arg2:string,arg3:string):Promise<installer.SystemResponse>;

export function EditHostNetwork(arg1:string,arg2:string,arg3:assistmodel.Network):Promise<assistmodel.Network>;

export function GetBackups():Promise<Array<storage.Backup>>;

export function DeleteConnectionBulk(arg1:Array<main.UUIDs>):Promise<any>;

export function DeleteStreamClone(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetConnection(arg1:string):Promise<storage.RubixConnection>;

export function GetNetworkBackupsByUUID(arg1:string,arg2:string,arg3:string):Promise<Array<storage.Backup>>;

export function GetPluginsNames(arg1:string,arg2:string):Promise<Array<main.PluginName>>;

export function AddStream(arg1:string,arg2:string,arg3:string,arg4:model.Stream):Promise<model.Stream>;

export function DeleteDevice(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DeleteLocationBulk(arg1:string,arg2:Array<main.UUIDs>):Promise<any>;

export function DeleteWriterCloneBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function GetConsumers(arg1:string,arg2:string):Promise<Array<model.Consumer>>;

export function GetHostNetworks(arg1:string):Promise<Array<assistmodel.Network>>;

export function GetReleases():Promise<Array<store.Release>>;

export function PingRubixAssist(arg1:string):Promise<boolean>;

export function AddConsumer(arg1:string,arg2:string,arg3:model.Consumer):Promise<model.Consumer>;

export function DisablePluginBulk(arg1:string,arg2:string,arg3:Array<main.PluginUUIDs>):Promise<any>;

export function EdgeCtlStatus(arg1:string,arg2:string,arg3:installer.SystemCtlBody):Promise<installer.AppSystemState>;

export function EdgeGetNetworks(arg1:string,arg2:string):Promise<Array<networking.NetworkInterfaces>>;

export function GetFlowPointSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetPluginByName(arg1:string,arg2:string,arg3:string):Promise<model.PluginConf|Error>;

export function GitListReleases(arg1:string):Promise<Array<store.ReleaseList>>;

export function RcSetNetworks(arg1:string,arg2:string,arg3:main.RcNetworkBody):void;

export function UpdateSettings(arg1:string,arg2:storage.Settings):Promise<storage.Settings>;

export function DeleteHostNetwork(arg1:string,arg2:string):Promise<assitcli.Response>;

export function DeleteStreamBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EdgeUnInstallApp(arg1:string,arg2:string,arg3:string):Promise<systemd.UninstallResponse>;

export function EnablePluginBulk(arg1:string,arg2:string,arg3:Array<main.PluginUUIDs>):Promise<any>;

export function GetBackupsByApplication(arg1:string,arg2:string,arg3:boolean):Promise<Array<storage.Backup>>;

export function ImportDevicesBulk(arg1:string,arg2:string,arg3:string,arg4:string):Promise<main.BulkAddResponse>;

export function EditDevice(arg1:string,arg2:string,arg3:string,arg4:model.Device):Promise<model.Device>;

export function GetSetting(arg1:string):Promise<storage.Settings>;

export function WiresBackup(arg1:string,arg2:string,arg3:string):Promise<storage.Backup>;

export function GetStreamClones(arg1:string,arg2:string):Promise<Array<model.StreamClone>>;

export function EdgeRubixScan(arg1:string,arg2:string):Promise<any>;

export function EdgeServiceMassAction(arg1:string,arg2:string,arg3:installer.SystemCtlBody):Promise<Array<installer.MassSystemResponse>>;

export function GetFlowNetworkSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetHostSchema(arg1:string):Promise<assistmodel.HostSchema>;

export function GetNetworkByPluginName(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Network>;

export function GetNetworksWithPoints(arg1:string,arg2:string):Promise<Array<model.Network>>;

export function GetStream(arg1:string,arg2:string,arg3:string):Promise<model.Stream>;

export function GetWriters(arg1:string,arg2:string):Promise<Array<model.Writer>>;

export function NodeValues():Promise<Array<node.Values>>;

export function CreateWriter(arg1:string,arg2:string,arg3:model.Writer):Promise<model.Writer>;

export function DeleteBackupBulk(arg1:Array<main.UUIDs>):Promise<any>;

export function DeleteStreamBulkClones(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EdgeProductInfo(arg1:string,arg2:string):Promise<installer.Product>;

export function GetBacnetDevicePoints(arg1:string,arg2:string,arg3:string,arg4:boolean,arg5:boolean):Promise<Array<model.Point>>;

export function GetDevice(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Device>;

export function GetFlowNetworks(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.FlowNetwork>>;

export function GetLocation(arg1:string,arg2:string):Promise<assistmodel.Location>;

export function WritePointValue(arg1:string,arg2:string,arg3:string,arg4:model.Priority):Promise<model.Point>;

export function GetNetworkWithPoints(arg1:string,arg2:string,arg3:string):Promise<model.Network>;

export function DeleteBackup(arg1:string):Promise<string>;

export function DeleteFlowNetworkClone(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DeleteLogBulk(arg1:Array<main.UUIDs>):Promise<any>;

export function DeleteNetwork(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DeleteProducer(arg1:string,arg2:string,arg3:string):Promise<any>;

export function EditConsumer(arg1:string,arg2:string,arg3:string,arg4:model.Consumer):Promise<model.Consumer>;

export function ExportPointBulk(arg1:string,arg2:string,arg3:string,arg4:string,arg5:Array<string>):Promise<storage.Backup>;

export function GetPoint(arg1:string,arg2:string,arg3:string):Promise<model.Point>;

export function GetRelease(arg1:string):Promise<store.Release>;

export function AddProducer(arg1:string,arg2:string,arg3:model.Producer):Promise<model.Producer>;

export function DeleteWriterClone(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetHostTime(arg1:string,arg2:string):Promise<any>;

export function GetLogsWithData():Promise<any>;

export function UpdateLocation(arg1:string,arg2:string,arg3:assistmodel.Location):Promise<assistmodel.Location>;

export function AddDevicesBulk(arg1:string,arg2:string,arg3:Array<model.Device>):void;

export function DeleteFlowNetworkCloneBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EdgeDeviceInfoAndApps(arg1:string,arg2:string,arg3:string):Promise<main.EdgeDeviceInfo>;

export function EditPoint(arg1:string,arg2:string,arg3:string,arg4:model.Point):Promise<model.Point>;

export function ExportNetworksBulk(arg1:string,arg2:string,arg3:string,arg4:Array<string>):Promise<storage.Backup>;

export function GetConsumerClones(arg1:string,arg2:string):Promise<Array<model.Consumer>>;

export function GetHosts(arg1:string):Promise<Array<assistmodel.Host>>;

export function NodeValue(arg1:string):Promise<node.Values>;

export function GetLocationTableSchema(arg1:string):Promise<any>;

export function GetPlugin(arg1:string,arg2:string,arg3:string):Promise<model.PluginConf>;

export function StoreCheckAppExists(arg1:string):Promise<Error>;

export function AddPoint(arg1:string,arg2:string,arg3:model.Point):Promise<model.Point>;

export function DeleteWriter(arg1:string,arg2:string,arg3:string):Promise<any>;

export function EditFlowNetwork(arg1:string,arg2:string,arg3:string,arg4:model.FlowNetwork):Promise<model.FlowNetwork>;

export function GetNetwork(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.Network>;

export function GetPcGetNetworksSchema():Promise<any>;

export function GetScannerSchema():Promise<any>;

export function OpenURL(arg1:string):void;

export function GetFlowNetworkClones(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.FlowNetworkClone>>;

export function AddConnection(arg1:storage.RubixConnection):Promise<storage.RubixConnection>;

export function AddLocation(arg1:string,arg2:assistmodel.Location):Promise<assistmodel.Location>;

export function EdgeDHCPSetAsAuto(arg1:string,arg2:string,arg3:system.NetworkingBody):Promise<system.Message>;

export function EdgeListPlugins(arg1:string,arg2:string):Promise<Array<appstore.Plugin>>;

export function EditStream(arg1:string,arg2:string,arg3:string,arg4:model.Stream):Promise<model.Stream>;

export function GetDevices(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.Device>>;

export function GetFlowNetworkClone(arg1:string,arg2:string,arg3:string,arg4:boolean):Promise<model.FlowNetworkClone>;

export function GetLocations(arg1:string):Promise<Array<assistmodel.Location>>;

export function GetLogsByConnection(arg1:string):Promise<any>;

export function GetNetworkSchema(arg1:string):Promise<any>;

export function GetPlugins(arg1:string,arg2:string):Promise<Array<model.PluginConf>>;

export function GetProducerClones(arg1:string,arg2:string):Promise<Array<model.Producer>>;

export function ImportNetworksBulk(arg1:string,arg2:string,arg3:string):Promise<main.BulkAddResponse>;

export function AddDevice(arg1:string,arg2:string,arg3:model.Device):Promise<model.Device>;

export function EdgeDeletePlugin(arg1:string,arg2:string,arg3:appstore.Plugin):Promise<model.Message>;

export function EdgeUpgradePlugins(arg1:string,arg2:string,arg3:string):Promise<assitcli.EdgeUploadResponse|Error>;

export function EditHost(arg1:string,arg2:string,arg3:assistmodel.Host):Promise<assistmodel.Host>;

export function GetConsumer(arg1:string,arg2:string,arg3:string):Promise<model.Consumer>;

export function GetLocalStorage(arg1:string,arg2:string):Promise<model.LocalStorageFlowNetwork|Error>;

export function RestartPluginBulk(arg1:string,arg2:string,arg3:Array<main.PluginUUIDs>):Promise<any>;

export function DeleteFlowNetwork(arg1:string,arg2:string,arg3:string):Promise<any>;

export function DeleteNetworkBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function EditNetwork(arg1:string,arg2:string,arg3:string,arg4:model.Network):Promise<model.Network>;

export function GetServerNetworking(arg1:string):Promise<any>;

export function WiresBackupRestore(arg1:string,arg2:string,arg3:string):Promise<any>;

export function AddPointsBulk(arg1:string,arg2:string,arg3:Array<model.Point>):void;

export function DeleteDeviceBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function DeleteFlowNetworkBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function DeleteHost(arg1:string,arg2:string):Promise<assitcli.Response>;

export function DeleteStream(arg1:string,arg2:string,arg3:string):Promise<any>;

export function StoreCheckAppAndVersionExists(arg1:string,arg2:string,arg3:string):Promise<Error>;

export function StoreDownloadApp(arg1:string,arg2:string,arg3:string,arg4:string,arg5:boolean):Promise<store.InstallResponse>;

export function GetLogs():Promise<any>;

export function ImportPointBulk(arg1:string,arg2:string,arg3:string,arg4:string):Promise<main.BulkAddResponse>;

export function PingHost(arg1:string,arg2:string):Promise<boolean>;

export function DownloadFlow(arg1:any,arg2:boolean):Promise<flow.Message>;

export function GetFlow():Promise<any>;

export function GetHost(arg1:string,arg2:string):Promise<assistmodel.Host>;

export function GetPoints(arg1:string,arg2:string):Promise<Array<model.Point>>;

export function GetPointsForDevice(arg1:string,arg2:string,arg3:string):Promise<Array<model.Point>>;

export function UpdateLocalStorage(arg1:string,arg2:string,arg3:model.LocalStorageFlowNetwork):Promise<model.LocalStorageFlowNetwork|Error>;

export function DownloadFlowDecoded(arg1:any,arg2:boolean):Promise<flow.Message>;

export function EdgeInstallAppsBulk(arg1:string,arg2:string,arg3:main.EdgeInstallAppsBulk):void;

export function EditProducer(arg1:string,arg2:string,arg3:string,arg4:model.Producer):Promise<model.Producer>;

export function ExportDevicesBulk(arg1:string,arg2:string,arg3:string,arg4:string,arg5:Array<string>):Promise<storage.Backup>;

export function GetConnections():Promise<Array<storage.RubixConnection>>;

export function GetStreamsByFlowNetwork(arg1:string,arg2:string,arg3:string):Promise<Array<model.Stream>>;

export function UpdateConnection(arg1:string,arg2:storage.RubixConnection):Promise<storage.RubixConnection>;

export function AddHost(arg1:string,arg2:assistmodel.Host):Promise<assistmodel.Host>;

export function AddHostNetwork(arg1:string,arg2:assistmodel.Network):Promise<assistmodel.Network>;

export function EdgeUploadPlugin(arg1:string,arg2:string,arg3:appstore.Plugin,arg4:boolean):Promise<assitcli.EdgeUploadResponse>;

export function GetNetworkDevices(arg1:string,arg2:string,arg3:string):Promise<Array<model.Device>>;

export function GetPcTime():Promise<datelib.Time>;

export function GetServerTime(arg1:string):Promise<any>;

export function DeleteConnection(arg1:string):Promise<string>;

export function DeleteConsumer(arg1:string,arg2:string,arg3:string):Promise<any>;

export function EdgeInstallApp(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string):Promise<systemd.InstallResponse>;

export function ExportBackup(arg1:string):void;

export function GetFlowDeviceSchema(arg1:string,arg2:string,arg3:string):Promise<any>;

export function GetWriterClones(arg1:string,arg2:string):Promise<Array<model.WriterClone>>;

export function BacnetWhois(arg1:string,arg2:string,arg3:string,arg4:string):Promise<Array<model.Device>>;

export function DeleteLocation(arg1:string,arg2:string):Promise<assitcli.Response>;

export function DeletePointBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function DeleteProducerBulk(arg1:string,arg2:string,arg3:Array<main.UUIDs>):Promise<any>;

export function GetConnectionSchema():Promise<main.ConnectionSchema>;

export function GetNetworkBackupsByPlugin(arg1:string,arg2:string,arg3:string):Promise<Array<storage.Backup>>;

export function GetStreams(arg1:string,arg2:string):Promise<Array<model.Stream>>;

export function EdgeServiceMassStatus(arg1:string,arg2:string,arg3:installer.SystemCtlBody):Promise<Array<installer.AppSystemState>>;

export function EditWriter(arg1:string,arg2:string,arg3:string,arg4:model.Writer,arg5:boolean):Promise<model.Writer>;

export function GetBackupsNoData():Promise<Array<storage.Backup>>;

export function GitDownloadRelease(arg1:string,arg2:string):Promise<store.Release>;

export function EdgeDHCPSetStaticIP(arg1:string,arg2:string,arg3:dhcpd.SetStaticIP):Promise<string>;

export function GetNetworks(arg1:string,arg2:string,arg3:boolean):Promise<Array<model.Network>>;

export function GetProducer(arg1:string,arg2:string,arg3:string):Promise<model.Producer>;

export function DeleteHostBulk(arg1:string,arg2:Array<main.UUIDs>):Promise<any>;

export function DoBackup(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string,arg6:any):Promise<storage.Backup>;

export function EdgeDHCPPortExists(arg1:string,arg2:string,arg3:system.NetworkingBody):Promise<system.DHCPPortExists>;

export function EdgeServiceStart(arg1:string,arg2:string,arg3:string):Promise<installer.SystemResponse>;

export function EdgeServiceStop(arg1:string,arg2:string,arg3:string):Promise<installer.SystemResponse>;

export function GetNetworksWithPointsDisplay(arg1:string,arg2:string):Promise<Array<main.NetworksList>>;

export function Scanner(arg1:string,arg2:string,arg3:number,arg4:Array<string>):Promise<any>;
