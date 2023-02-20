import { backend, model, rumodel, storage } from "../../../../../../wailsjs/go/models";
import {
  AddNetwork,
  DeleteNetwork,
  DeleteNetworkBulk,
  EditNetwork,
  ExportNetworksBulk,
  GetFlowNetworkSchema,
  GetNetwork,
  GetNetworks,
  GetNetworksWithPointsDisplay,
  GetNetworkWithPoints,
  ImportNetworksBulk,
  SyncNetworks,
} from "../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}

export class FlowNetworkFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(withDevice: boolean): Promise<Array<model.Network>> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return GetNetworks(this.connectionUUID, this.hostUUID, withDevice);
  }

  async GetOne(uuid: string, withDevice: boolean): Promise<model.Network> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return GetNetwork(this.connectionUUID, this.hostUUID, uuid, withDevice);
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
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return AddNetwork(this.connectionUUID, this.hostUUID, body);
  }

  async Update(uuid: string, body: model.Network): Promise<model.Network> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return EditNetwork(this.connectionUUID, this.hostUUID, uuid, body);
  }

  async Delete(uuid: string): Promise<model.Network> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return DeleteNetwork(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return DeleteNetworkBulk(this.connectionUUID, this.hostUUID, uuids);
  }

  async BulkImport(backupUUID: string): Promise<backend.BulkAddResponse> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await ImportNetworksBulk(this.connectionUUID, this.hostUUID, backupUUID);
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

  async Sync(): Promise<rumodel.Response> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return SyncNetworks(this.connectionUUID, this.hostUUID);
  }
}
