// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import { storage } from "../models";
import { model } from "../models";
import { assistmodel } from "../models";
import { store } from "../models";
import { main } from "../models";
import { assitcli } from "../models";
import { installer } from "../models";
import { systemctl } from "../models";
import { edgecli } from "../models";
import { appstore } from "../models";
import { edge } from "../models";
import { networking } from "../models";
import { datelib } from "../models";

export function AddConnection(
  arg1: storage.RubixConnection
): Promise<storage.RubixConnection>;

export function AddConsumer(
  arg1: string,
  arg2: string,
  arg3: model.Consumer
): Promise<model.Consumer>;

export function AddDevice(
  arg1: string,
  arg2: string,
  arg3: model.Device
): Promise<model.Device>;

export function AddFlowNetwork(
  arg1: string,
  arg2: string,
  arg3: model.FlowNetwork
): Promise<model.FlowNetwork>;

export function AddHost(
  arg1: string,
  arg2: assistmodel.Host
): Promise<assistmodel.Host>;

export function AddHostNetwork(
  arg1: string,
  arg2: assistmodel.Network
): Promise<assistmodel.Network>;

export function AddLocation(
  arg1: string,
  arg2: assistmodel.Location
): Promise<assistmodel.Location>;

export function AddNetwork(
  arg1: string,
  arg2: string,
  arg3: model.Network
): Promise<model.Network>;

export function AddPoint(
  arg1: string,
  arg2: string,
  arg3: model.Point
): Promise<model.Point>;

export function AddProducer(
  arg1: string,
  arg2: string,
  arg3: model.Producer
): Promise<model.Producer>;

export function AddRelease(arg1: string, arg2: string): Promise<store.Release>;

export function AddStream(
  arg1: string,
  arg2: string,
  arg3: model.Stream
): Promise<model.Stream>;

export function BacnetWhois(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string
): Promise<model.Device>;

export function ConfigBACnetServer(
  arg1: main.ConfigBACnetServer
): Promise<Error>;

export function DeleteAllConnections(): Promise<main.DeleteAllConnections>;

export function DeleteBackup(arg1: string): Promise<string>;

export function DeleteBackupBulk(arg1: Array<main.UUIDs>): Promise<any>;

export function DeleteConnection(arg1: string): Promise<string>;

export function DeleteConnectionBulk(arg1: Array<main.UUIDs>): Promise<any>;

export function DeleteConsumer(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteConsumerBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteDevice(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteDeviceBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteFlowNetwork(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteFlowNetworkBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteFlowNetworkClone(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteFlowNetworkCloneBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteHost(
  arg1: string,
  arg2: string
): Promise<assitcli.Response>;

export function DeleteHostBulk(
  arg1: string,
  arg2: Array<main.UUIDs>
): Promise<any>;

export function DeleteHostNetwork(
  arg1: string,
  arg2: string
): Promise<assitcli.Response>;

export function DeleteHostNetworkBulk(
  arg1: string,
  arg2: Array<main.UUIDs>
): Promise<any>;

export function DeleteLocation(
  arg1: string,
  arg2: string
): Promise<assitcli.Response>;

export function DeleteLocationBulk(
  arg1: string,
  arg2: Array<main.UUIDs>
): Promise<any>;

export function DeleteLogBulk(arg1: Array<main.UUIDs>): Promise<any>;

export function DeleteNetwork(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteNetworkBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeletePoint(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeletePointBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteProducer(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteProducerBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DeleteStream(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DeleteStreamBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.UUIDs>
): Promise<any>;

export function DisablePlugin(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function DisablePluginBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.PluginUUIDs>
): Promise<any>;

export function DoBackup(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string,
  arg5: string,
  arg6: any
): Promise<storage.Backup>;

export function EdgeCtlStatus(
  arg1: string,
  arg2: string,
  arg3: installer.CtlBody
): Promise<systemctl.SystemState>;

export function EdgeDeleteAllPlugins(
  arg1: string,
  arg2: string
): Promise<edgecli.Message>;

export function EdgeDeletePlugin(
  arg1: string,
  arg2: string,
  arg3: appstore.Plugin
): Promise<edgecli.Message>;

export function EdgeDeviceInfoAndApps(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<main.EdgeDeviceInfo>;

export function EdgeInstallApp(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string,
  arg5: string,
  arg6: string
): Promise<installer.InstallResp>;

export function EdgeListPlugins(
  arg1: string,
  arg2: string
): Promise<Array<appstore.Plugin>>;

export function EdgeProductInfo(
  arg1: string,
  arg2: string
): Promise<installer.Product>;

export function EdgeReplaceConfig(
  arg1: string,
  arg2: string,
  arg3: appstore.EdgeReplaceConfig
): Promise<appstore.EdgeReplaceConfigResp>;

export function EdgeServiceDisable(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: number
): Promise<systemctl.SystemResponse>;

export function EdgeServiceEnable(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: number
): Promise<systemctl.SystemResponse>;

export function EdgeServiceMassAction(
  arg1: string,
  arg2: string,
  arg3: installer.CtlBody
): Promise<Array<systemctl.MassSystemResponse>>;

export function EdgeServiceMassStatus(
  arg1: string,
  arg2: string,
  arg3: installer.CtlBody
): Promise<Array<systemctl.SystemState>>;

export function EdgeServiceRestart(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: number
): Promise<systemctl.SystemResponse>;

export function EdgeServiceStart(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: number
): Promise<systemctl.SystemResponse>;

export function EdgeServiceStop(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: number
): Promise<systemctl.SystemResponse>;

export function EdgeServices(
  arg1: string,
  arg2: string
): Promise<Array<installer.InstalledServices>>;

export function EdgeUnInstallApp(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<installer.RemoveRes>;

export function EdgeUploadPlugin(
  arg1: string,
  arg2: string,
  arg3: appstore.Plugin,
  arg4: boolean
): Promise<assitcli.EdgeUploadResponse>;

export function EditConsumer(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Consumer
): Promise<model.Consumer>;

export function EditDevice(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Device
): Promise<model.Device>;

export function EditFlowNetwork(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.FlowNetwork
): Promise<model.FlowNetwork>;

export function EditHost(
  arg1: string,
  arg2: string,
  arg3: assistmodel.Host
): Promise<assistmodel.Host>;

export function EditHostNetwork(
  arg1: string,
  arg2: string,
  arg3: assistmodel.Network
): Promise<assistmodel.Network>;

export function EditNetwork(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Network
): Promise<model.Network>;

export function EditPoint(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Point
): Promise<model.Point>;

export function EditProducer(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Producer
): Promise<model.Producer>;

export function EditStream(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: model.Stream
): Promise<model.Stream>;

export function EnablePlugin(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function EnablePluginBulk(
  arg1: string,
  arg2: string,
  arg3: Array<main.PluginUUIDs>
): Promise<any>;

export function ExportBackup(arg1: string): void;

export function ExportDevicesBulk(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string,
  arg5: Array<string>
): Promise<storage.Backup>;

export function ExportNetworksBulk(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: Array<string>
): Promise<storage.Backup>;

export function ExportPointBulk(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string,
  arg5: Array<string>
): Promise<storage.Backup>;

export function GetBackup(arg1: string): Promise<storage.Backup>;

export function GetBackups(): Promise<Array<storage.Backup>>;

export function GetBackupsByApplication(
  arg1: string,
  arg2: string,
  arg3: boolean
): Promise<Array<storage.Backup>>;

export function GetBackupsNoData(): Promise<Array<storage.Backup>>;

export function GetBacnetDevicePoints(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean,
  arg5: boolean
): Promise<Array<model.Point>>;

export function GetConnection(arg1: string): Promise<storage.RubixConnection>;

export function GetConnectionSchema(): Promise<main.ConnectionSchema>;

export function GetConnections(): Promise<Array<storage.RubixConnection>>;

export function GetConsumer(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.Consumer>;

export function GetConsumerClones(
  arg1: string,
  arg2: string
): Promise<Array<model.Consumer>>;

export function GetConsumers(
  arg1: string,
  arg2: string
): Promise<Array<model.Consumer>>;

export function GetDevice(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean
): Promise<model.Device>;

export function GetDevices(
  arg1: string,
  arg2: string,
  arg3: boolean
): Promise<Array<model.Device>>;

export function GetFlowDeviceSchema(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function GetFlowNetwork(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean
): Promise<model.FlowNetwork>;

export function GetFlowNetworkClone(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean
): Promise<model.FlowNetworkClone>;

export function GetFlowNetworkClones(
  arg1: string,
  arg2: string,
  arg3: boolean
): Promise<Array<model.FlowNetworkClone>>;

export function GetFlowNetworkSchema(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function GetFlowNetworks(
  arg1: string,
  arg2: string,
  arg3: boolean
): Promise<Array<model.FlowNetwork>>;

export function GetFlowPointSchema(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;

export function GetGitToken(arg1: string, arg2: boolean): Promise<string>;

export function GetHost(arg1: string, arg2: string): Promise<assistmodel.Host>;

export function GetHostActiveNetworks(arg1: string, arg2: string): Promise<any>;

export function GetHostInterfaces(
  arg1: string,
  arg2: string
): Promise<edge.InterfaceNames>;

export function GetHostInternetIP(
  arg1: string,
  arg2: string
): Promise<edge.InternetIP>;

export function GetHostNetwork(
  arg1: string,
  arg2: string
): Promise<assistmodel.Network>;

export function GetHostNetworks(
  arg1: string
): Promise<Array<assistmodel.Network>>;

export function GetHostSchema(arg1: string): Promise<any>;

export function GetHostTime(arg1: string, arg2: string): Promise<any>;

export function GetHosts(arg1: string): Promise<Array<assistmodel.Host>>;

export function GetLocation(
  arg1: string,
  arg2: string
): Promise<assistmodel.Location>;

export function GetLocationSchema(arg1: string): Promise<any>;

export function GetLocationTableSchema(arg1: string): Promise<any>;

export function GetLocations(
  arg1: string
): Promise<Array<assistmodel.Location>>;

export function GetLogs(): Promise<any>;

export function GetLogsByConnection(arg1: string): Promise<any>;

export function GetLogsWithData(): Promise<any>;

export function GetNetwork(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean
): Promise<model.Network>;

export function GetNetworkBackupsByPlugin(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<Array<storage.Backup>>;

export function GetNetworkBackupsByUUID(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<Array<storage.Backup>>;

export function GetNetworkByPluginName(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: boolean
): Promise<model.Network>;

export function GetNetworkDevices(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<Array<model.Device>>;

export function GetNetworkSchema(arg1: string): Promise<any>;

export function GetNetworkWithPoints(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.Network>;

export function GetNetworks(
  arg1: string,
  arg2: string,
  arg3: boolean
): Promise<Array<model.Network>>;

export function GetNetworksWithPoints(
  arg1: string,
  arg2: string
): Promise<Array<model.Network>>;

export function GetNetworksWithPointsDisplay(
  arg1: string,
  arg2: string
): Promise<Array<main.NetworksList>>;

export function GetPcGetNetworks(): Promise<any>;

export function GetPcGetNetworksSchema(): Promise<any>;

export function GetPcInterfaces(): Promise<networking.InterfaceNames>;

export function GetPcTime(): Promise<datelib.Time>;

export function GetPlugin(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.PluginConf>;

export function GetPluginByName(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.PluginConf>;

export function GetPlugins(
  arg1: string,
  arg2: string
): Promise<Array<model.PluginConf>>;

export function GetPluginsNames(
  arg1: string,
  arg2: string
): Promise<Array<main.PluginName>>;

export function GetPoint(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.Point>;

export function GetPoints(
  arg1: string,
  arg2: string
): Promise<Array<model.Point>>;

export function GetPointsForDevice(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<Array<model.Point>>;

export function GetProducer(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.Producer>;

export function GetProducerClones(
  arg1: string,
  arg2: string
): Promise<Array<model.Producer>>;

export function GetProducers(
  arg1: string,
  arg2: string
): Promise<Array<model.Producer>>;

export function GetRelease(arg1: string): Promise<store.Release>;

export function GetReleaseByVersion(arg1: string): Promise<store.Release>;

export function GetReleases(): Promise<Array<store.Release>>;

export function GetScannerSchema(): Promise<any>;

export function GetServerNetworking(arg1: string): Promise<any>;

export function GetServerTime(arg1: string): Promise<any>;

export function GetSetting(arg1: string): Promise<storage.Settings>;

export function GetStream(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<model.Stream>;

export function GetStreamClones(
  arg1: string,
  arg2: string
): Promise<Array<model.StreamClone>>;

export function GetStreams(
  arg1: string,
  arg2: string
): Promise<Array<model.Stream>>;

export function GitDownloadRelease(
  arg1: string,
  arg2: string
): Promise<store.Release>;

export function GitListReleases(
  arg1: string
): Promise<Array<store.ReleaseList>>;

export function HostRubixScan(arg1: string, arg2: string): Promise<any>;

export function ImportBackup(arg1: storage.Backup): Promise<string>;

export function ImportDevicesBulk(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string
): Promise<main.BulkAddResponse>;

export function ImportNetworksBulk(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<main.BulkAddResponse>;

export function ImportPointBulk(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string
): Promise<main.BulkAddResponse>;

export function OpenURL(arg1: string): void;

export function PingHost(arg1: string, arg2: string): Promise<boolean>;

export function PingRubixAssist(arg1: string): Promise<boolean>;

export function Scanner(
  arg1: string,
  arg2: string,
  arg3: number,
  arg4: Array<string>
): Promise<any>;

export function StoreCheckAppAndVersionExists(
  arg1: string,
  arg2: string
): Promise<Error>;

export function StoreCheckAppExists(arg1: string): Promise<Error>;

export function StoreDownloadApp(
  arg1: string,
  arg2: string,
  arg3: string,
  arg4: string,
  arg5: boolean
): Promise<store.InstallResponse>;

export function UpdateConnection(
  arg1: string,
  arg2: storage.RubixConnection
): Promise<storage.RubixConnection>;

export function UpdateLocation(
  arg1: string,
  arg2: string,
  arg3: assistmodel.Location
): Promise<assistmodel.Location>;

export function UpdateSettings(
  arg1: string,
  arg2: storage.Settings
): Promise<storage.Settings>;

export function WiresBackup(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<storage.Backup>;

export function WiresBackupRestore(
  arg1: string,
  arg2: string,
  arg3: string
): Promise<any>;
