import {backend, model} from "../../../../../../../wailsjs/go/models";
import {
  AddStream,
  DeleteStream,
  DeleteStreamBulk,
  EditStream,
  GetStreams, GetStreamsByFlowNetwork,
} from "../../../../../../../wailsjs/go/backend/App";

export class FlowStreamFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(): Promise<Array<model.Stream>> {
    return GetStreams(this.connectionUUID, this.hostUUID);
  }

  async GetAllByFlowNetwork(flowNetworkUUID: string): Promise<Array<model.Stream>> {
    return GetStreamsByFlowNetwork(this.connectionUUID, this.hostUUID, flowNetworkUUID);
  }

  async Add(flowNetworkUUID: string, body: model.Stream): Promise<model.Stream> {
    return AddStream(this.connectionUUID, this.hostUUID, flowNetworkUUID, body)
  }

  async Update(uuid: string, body: model.Stream): Promise<model.Stream> {
    return EditStream(this.connectionUUID, this.hostUUID, uuid, body)
  }

  async Delete(uuid: string): Promise<model.Stream> {
    return DeleteStream(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    return DeleteStreamBulk(this.connectionUUID, this.hostUUID, uuids);
  }
}
