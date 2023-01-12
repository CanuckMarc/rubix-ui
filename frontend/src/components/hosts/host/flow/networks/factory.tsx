import {backend, model, storage, store} from "../../../../../../wailsjs/go/models";
import {
  AddNetwork,
  DeleteNetwork,
  DeleteNetworkBulk,
  EditNetwork,
  ExportNetworksBulk,
  GetFlowNetworkSchema,
  GetNetwork,
  GetNetworks, GetNetworksWithPointsDisplay, GetNetworkWithPoints,
  ImportNetworksBulk,
} from "../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}

export class FlowNetworkFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(withDevice: boolean): Promise<Array<model.Network>> {
    let resp: Promise<Array<model.Network>> = {} as Promise<
      Array<model.Network>
    >;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await GetNetworks(this.connectionUUID, this.hostUUID, withDevice)
      .then((res) => {
        resp = res as unknown as Promise<Array<model.Network>>;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async GetOne(uuid: string, withDevice: boolean): Promise<model.Network> {
    let resp: model.Network = {} as model.Network;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await GetNetwork(this.connectionUUID, this.hostUUID, uuid, withDevice)
      .then((res) => {
        resp = res as model.Network;
      })
      .catch((resp) => {
        return resp;
      });
    return resp;
  }

  async GetNetworkWithPoints(uuid: string): Promise<model.Network> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await GetNetworkWithPoints(this.connectionUUID, this.hostUUID, uuid);
  }

  async GetNetworksWithPointsDisplay(): Promise<Array<backend.NetworksList>> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await GetNetworksWithPointsDisplay(this.connectionUUID, this.hostUUID);
  }

  async Add(body: model.Network): Promise<model.Network> {
    let resp: model.Network = {} as model.Network;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await AddNetwork(this.connectionUUID, this.hostUUID, body)
      .then((res) => {
        resp = res as model.Network;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async Update(uuid: string, body: model.Network): Promise<model.Network> {
    let resp: model.Network = {} as model.Network;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await EditNetwork(this.connectionUUID, this.hostUUID, uuid, body)
      .then((res) => {
        resp = res as model.Network;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async Delete(uuid: string): Promise<model.Network> {
    let resp: model.Network = {} as model.Network;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await DeleteNetwork(this.connectionUUID, this.hostUUID, uuid)
      .then((res) => {
        resp = res as model.Network;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    let resp: Promise<any> = {} as Promise<any>;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await DeleteNetworkBulk(this.connectionUUID, this.hostUUID, uuids)
      .then((res) => {
        resp = res as Promise<any>;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async BulkImport(backupUUID: string): Promise<backend.BulkAddResponse> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await ImportNetworksBulk(
      this.connectionUUID,
      this.hostUUID,
      backupUUID
    );
  }

  async BulkExport(
    userComment: string,
    uuids: Array<string>
  ): Promise<storage.Backup> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await ExportNetworksBulk(
      this.connectionUUID,
      this.hostUUID,
      userComment,
      uuids
    );
  }

  async Schema(
    connUUID: string,
    hostUUID: string,
    setPluginName: string
  ): Promise<any> {
    hasUUID(connUUID);
    hasUUID(hostUUID);
    const resp = await GetFlowNetworkSchema(connUUID, hostUUID, setPluginName);
    const res = JSON.parse(resp || "{}");
    res.plugin_name = setPluginName;
    return res;
  }
}
