import { backend, model, rumodel } from "../../../../../../../wailsjs/go/models";
import {
  AddStream,
  DeleteStream,
  DeleteStreamBulk,
  EditStream,
  GetFlowNetwork,
  SyncStreams,
} from "../../../../../../../wailsjs/go/backend/App";

export class FlowStreamFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(flowNetworkUUID: string): Promise<model.FlowNetwork> {
    return GetFlowNetwork(this.connectionUUID, this.hostUUID, flowNetworkUUID, true);
  }

  async Add(flowNetworkUUID: string, body: model.Stream): Promise<model.Stream> {
    return AddStream(this.connectionUUID, this.hostUUID, flowNetworkUUID, body);
  }

  async Update(uuid: string, body: model.Stream): Promise<model.Stream> {
    return EditStream(this.connectionUUID, this.hostUUID, uuid, body);
  }

  async Delete(uuid: string): Promise<model.Stream> {
    return DeleteStream(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    return DeleteStreamBulk(this.connectionUUID, this.hostUUID, uuids);
  }

  async Sync(flowNetworkUUID: string): Promise<rumodel.Response> {
    return SyncStreams(this.connectionUUID, this.hostUUID, flowNetworkUUID);
  }
}
