import { amodel, assistcli, backend, rumodel, streamlog } from "../../../wailsjs/go/models";
import {
  AddHost,
  DeleteHost,
  DeleteHostBulk,
  EditHost,
  GetHost,
  GetHosts,
  GetHostSchema,
  ConfigureOpenVPN,
  PingHost,
  UpdateHostsStatus, EdgeAppNewLog,
} from "../../../wailsjs/go/backend/App";
import Host = amodel.Host;
import Response = assistcli.Response;
import UUIDs = backend.UUIDs;

export class HostsFactory {
  uuid!: string;
  connectionUUID!: string;
  private _this!: Host;

  get this(): Host {
    return this._this;
  }

  set this(value: Host) {
    this._this = value;
  }

  async Schema(): Promise<any> {
    const resp = await GetHostSchema(this.connectionUUID);
    return JSON.parse(resp || "{}");
  }

  async PingHost(): Promise<boolean> {
    return await PingHost(this.connectionUUID, this.uuid);
  }

  async GetAll(): Promise<Array<Host>> {
    return await GetHosts(this.connectionUUID);
  }

  async GetOne(): Promise<Host> {
    return await GetHost(this.connectionUUID, this.uuid);
  }

  async Add(): Promise<rumodel.Response> {
    return await AddHost(this.connectionUUID, this._this);
  }

  async Update(): Promise<rumodel.Response> {
    return await EditHost(this.connectionUUID, this.uuid, this._this);
  }

  async Delete(): Promise<Response> {
    return await DeleteHost(this.connectionUUID, this.uuid);
  }

  async BulkDelete(uuids: Array<UUIDs>): Promise<any> {
    return await DeleteHostBulk(this.connectionUUID, uuids);
  }

  async UpdateHostsStatus(hostNetworkUUID: string): Promise<amodel.Network> {
    return await UpdateHostsStatus(this.connectionUUID, hostNetworkUUID);
  }

  async ConfigureOpenVPN(): Promise<boolean> {
    return await ConfigureOpenVPN(this.connectionUUID, this.uuid);
  }

  // let user get app logs
  async EdgeAppNewLog(connUUID: string, hostUUID: string, appName: string, duration: number):Promise<streamlog.Log> {
    return await EdgeAppNewLog(connUUID, hostUUID, appName, duration);
  }

}
