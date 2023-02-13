import { backend, model } from "../../../../../../../wailsjs/go/models";
import {
  AddFlowNetwork,
  DeleteFlowNetwork,
  DeleteFlowNetworkBulk,
  EditFlowNetwork,
  FFSystemPing,
  GetFlowNetworks,
} from "../../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}

export class FlowFrameworkNetworkFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(withStream: boolean): Promise<Array<model.FlowNetwork>> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return GetFlowNetworks(this.connectionUUID, this.hostUUID, withStream);
  }

  async Add(body: model.FlowNetwork): Promise<model.FlowNetwork> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return AddFlowNetwork(this.connectionUUID, this.hostUUID, body);
  }

  async Update(uuid: string, body: model.FlowNetwork): Promise<model.FlowNetwork> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return EditFlowNetwork(this.connectionUUID, this.hostUUID, uuid, body);
  }

  async Delete(uuid: string): Promise<model.FlowNetwork> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return DeleteFlowNetwork(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return DeleteFlowNetworkBulk(this.connectionUUID, this.hostUUID, uuids);
  }

  async FFSystemPing(hostUUID: string): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(hostUUID);
    return FFSystemPing(this.connectionUUID, hostUUID);
  }
}
