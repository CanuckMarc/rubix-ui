import {backend, model, store} from "../../../../../../../wailsjs/go/models";
import {
  AddStream,
  DeleteStream,
  DeleteStreamBulk,
  EditStream,
  GetStreams, GetStreamsByFlowNetwork,
} from "../../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}

export class FlowStreamFactory {
  hostUUID!: string;
  connectionUUID!: string;


  async GetAll(): Promise<Array<model.Stream>> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await GetStreams(this.connectionUUID, this.hostUUID);
  }

  async GetAllByFlowNetwork(flowNetworkUUID: string): Promise<Array<model.Stream>> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await GetStreamsByFlowNetwork(this.connectionUUID, this.hostUUID, flowNetworkUUID);
  }

  async Add(flowNetworkUUID: string, body: model.Stream): Promise<model.Stream> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await AddStream(this.connectionUUID, this.hostUUID, flowNetworkUUID, body)
  }

  async Update(uuid: string, body: model.Stream): Promise<model.Stream> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await EditStream(this.connectionUUID, this.hostUUID, uuid, body)
  }

  async Delete(uuid: string): Promise<model.Stream> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await DeleteStream(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return DeleteStreamBulk(this.connectionUUID, this.hostUUID, uuids);
  }
}
