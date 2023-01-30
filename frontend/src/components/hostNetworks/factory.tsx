import {
  AddHostNetwork,
  DeleteHostNetworkBulk,
  EditHostNetwork,
  GetHostNetwork,
  GetHostNetworks,
  GetNetworkSchema,
} from "../../../wailsjs/go/backend/App";
import { Helpers } from "../../helpers/checks";
import { amodel, backend } from "../../../wailsjs/go/models";

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

  async GetAll(): Promise<Array<amodel.Network>> {
    return GetHostNetworks(this.connectionUUID)
  }

  async GetOne(): Promise<amodel.Network> {
    hasUUID(this.uuid);
    const res = await GetHostNetwork(this.connectionUUID, this.uuid)
    const one = res as amodel.Network;
    this._this = one;
    return one;
  }

  async Add(): Promise<amodel.Network> {
    hasUUID(this.connectionUUID);
    const res = await AddHostNetwork(this.connectionUUID, this._this)
    const one = res as amodel.Network;
    this._this = one;
    return one;
  }

  async Update(): Promise<amodel.Network> {
    hasUUID(this.uuid);
    const res = await EditHostNetwork(this.connectionUUID, this.uuid, this._this)
    const one = res as amodel.Network;
    this._this = one;
    return one;
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
