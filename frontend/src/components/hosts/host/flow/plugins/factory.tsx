import {
  EdgeEnablePlugins, EdgeGetConfigPlugin,
  EdgeGetPlugins,
  EdgeGetPluginsDistribution,
  EdgeInstallPlugin,
  EdgeRestartPlugins,
  EdgeUninstallPlugin, EdgeUpdateConfigPlugin, FlowNetworkNewLog,
} from "../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../helpers/checks";
import { streamlog } from "../../../../../../wailsjs/go/models";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}


export class FlowPluginFactory {
  hostUUID!: string;
  connectionUUID!: string;
  uuid!: string;

  async GetPluginsDistribution(connUUID: string, hostUUID: string): Promise<any> {
    return await EdgeGetPluginsDistribution(connUUID, hostUUID);
  }

  async GetAll(): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    const plugins = await EdgeGetPlugins(this.connectionUUID, this.hostUUID);
    return plugins.data;
  }

  async BulkEnable(pluginNames: Array<string>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await EdgeEnablePlugins(this.connectionUUID, this.hostUUID, pluginNames, true);
  }

  async BulkDisable(pluginNames: Array<string>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await EdgeEnablePlugins(this.connectionUUID, this.hostUUID, pluginNames, false);
  }

  async RestartBulk(pluginNames: Array<string>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await EdgeRestartPlugins(this.connectionUUID, this.hostUUID, pluginNames);
  }

  async InstallPlugin(connUUID: string, hostUUID: string, pluginName: string): Promise<any> {
    return await EdgeInstallPlugin(connUUID, hostUUID, pluginName);
  }

  async UnInstallPlugin(connUUID: string, hostUUID: string, pluginName: string): Promise<any> {
    return await EdgeUninstallPlugin(connUUID, hostUUID, pluginName);
  }

  async EdgeGetConfigPlugin(connUUID: string, hostUUID: string, pluginName: string): Promise<any> {
    return await EdgeGetConfigPlugin(connUUID, hostUUID, pluginName);
  }

  async EdgeUpdateConfigPlugin(connUUID: string, hostUUID: string, pluginName: string, config: string): Promise<any> {
    return await EdgeUpdateConfigPlugin(connUUID, hostUUID, pluginName, config);
  }

  // FlowNetworkNewLog let user get network driver logs from flow framework
  async FlowNetworkNewLog(connUUID: string, hostUUID: string, pluginName: string, duration: number):Promise<streamlog.Log> {
    return await FlowNetworkNewLog(connUUID, hostUUID, pluginName, duration);
  }

}
