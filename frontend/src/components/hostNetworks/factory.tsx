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

  // get the first connection uuid
  async GetFist(): Promise<amodel.Network> {
    let one: amodel.Network = {} as amodel.Network;
    await this.GetAll()
      .then((res) => {
        one = res.at(0) as amodel.Network;
        this._this = one;
      })
      .catch((err) => {
        return undefined;
      });
    return one;
  }

  async GetAll(): Promise<Array<amodel.Network>> {
    let all: Array<amodel.Network> = {} as Array<amodel.Network>;
    await GetHostNetworks(this.connectionUUID)
      .then((res) => {
        all = res as Array<amodel.Network>;
      })
      .catch((err) => {
        return undefined;
      });
    return all;
  }

  async GetOne(): Promise<amodel.Network> {
    hasUUID(this.uuid);
    let one: amodel.Network = {} as amodel.Network;
    await GetHostNetwork(this.connectionUUID, this.uuid)
      .then((res) => {
        one = res as amodel.Network;
        this._this = one;
      })
      .catch((err) => {
        return undefined;
      });
    return one;
  }

  async Add(): Promise<amodel.Network> {
    hasUUID(this.connectionUUID);
    let one: amodel.Network = {} as amodel.Network;
    await AddHostNetwork(this.connectionUUID, this._this)
      .then((res) => {
        one = res as amodel.Network;
        this._this = one;
      })
      .catch((err) => {
        return undefined;
      });
    return one;
  }

  async Update(): Promise<amodel.Network> {
    hasUUID(this.uuid);
    let one: amodel.Network = {} as amodel.Network;
    await EditHostNetwork(this.connectionUUID, this.uuid, this._this)
      .then((res) => {
        one = res as amodel.Network;
        this._this = one;
      })
      .catch((err) => {
        return undefined;
      });
    return one;
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    let out: Promise<any> = {} as Promise<any>;
    await DeleteHostNetworkBulk(this.connectionUUID, uuids)
      .then((res) => {
        out = res as Promise<any>;
      })
      .catch((err) => {
        return undefined;
      });
    return out;
  }

  async Schema(): Promise<any> {
    hasUUID(this.connectionUUID);
    const resp = await GetNetworkSchema(this.connectionUUID)
    return JSON.parse(resp || "{}");
  }
}
