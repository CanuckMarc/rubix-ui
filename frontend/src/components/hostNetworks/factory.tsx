import {
  AddHostNetwork,
  DeleteHostNetworkBulk,
  EditHostNetwork,
  GetHostNetwork,
  GetLocation,
  GetNetworkSchema,
} from "../../../wailsjs/go/backend/App";
import { Helpers } from "../../helpers/checks";
import { amodel, backend, rumodel } from "../../../wailsjs/go/models";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "network or connection uuid") as Error;
}

export class NetworksFactory {
  uuid!: string;
  connectionUUID!: string;
  _this!: amodel.Network;
  private count!: number;

  get this(): amodel.Network {
    return this._this;
  }

  set this(value: amodel.Network) {
    this._this = value;
  }

  public GetTotalCount(): number {
    return this.count;
  }

  async GetAll(locationUUID: string): Promise<Array<amodel.Network>> {
    const res = await GetLocation(this.connectionUUID, locationUUID)
    return res.networks
  }

  async GetOne(): Promise<amodel.Network> {
    hasUUID(this.uuid);
    const res = await GetHostNetwork(this.connectionUUID, this.uuid)
    const one = res as amodel.Network;
    this._this = one;
    return one;
  }

  async Add(): Promise<rumodel.Response> {
    hasUUID(this.connectionUUID);
    return await AddHostNetwork(this.connectionUUID, this._this)
  }

  async Update(): Promise<rumodel.Response> {
    hasUUID(this.uuid);
    return await EditHostNetwork(this.connectionUUID, this.uuid, this._this)
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    return await DeleteHostNetworkBulk(this.connectionUUID, uuids)
  }

  async Schema(): Promise<any> {
    hasUUID(this.connectionUUID);
    const resp = await GetNetworkSchema(this.connectionUUID)
    return JSON.parse(resp || "{}");
  }
}
