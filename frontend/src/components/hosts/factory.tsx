import { amodel, assistcli, backend } from "../../../wailsjs/go/models";
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
  UpdateStatus,
} from "../../../wailsjs/go/backend/App";
import Host = amodel.Host;
import HostSchema = amodel.HostSchema;
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

  async Schema(): Promise<HostSchema> {
    return await GetHostSchema(this.connectionUUID);
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

  async Add(): Promise<Host> {
    return await AddHost(this.connectionUUID, this._this);
  }

  async Update(): Promise<Host> {
    return await EditHost(this.connectionUUID, this.uuid, this._this);
  }

  async Delete(): Promise<Response> {
    return await DeleteHost(this.connectionUUID, this.uuid);
  }

  async BulkDelete(uuids: Array<UUIDs>): Promise<any> {
    return await DeleteHostBulk(this.connectionUUID, uuids);
  }

  async UpdateStatus(): Promise<Array<Host>> {
    return await UpdateStatus(this.connectionUUID);
  }

  async ConfigureOpenVPN(): Promise<boolean> {
    return await ConfigureOpenVPN(this.connectionUUID, this.uuid);
  }
}
