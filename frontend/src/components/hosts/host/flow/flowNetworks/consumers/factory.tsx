import { backend, model, rumodel } from "../../../../../../../wailsjs/go/models";
import {
  AddConsumer,
  DeleteConsumer,
  DeleteConsumerBulk,
  EditConsumer,
  GetConsumer,
  GetProducersUnderStreamClone,
  GetStreamClone,
} from "../../../../../../../wailsjs/go/backend/App";

export class FlowConsumerFactory {
  hostUUID!: string;
  connectionUUID!: string;
  streamCloneUUID!: string;

  async GetAll(withConsumers: boolean, withWriters: boolean): Promise<rumodel.Response> {
    return GetStreamClone(this.connectionUUID, this.hostUUID, this.streamCloneUUID, withConsumers, withWriters);
  }

  async GetProducersUnderStreamClone(): Promise<rumodel.Response> {
    return GetProducersUnderStreamClone(this.connectionUUID, this.hostUUID, this.streamCloneUUID);
  }

  async GetOne(uuid: string): Promise<model.Consumer> {
    return GetConsumer(this.connectionUUID, this.hostUUID, uuid)
  }

  async Add(body: model.Consumer): Promise<model.Consumer> {
    return AddConsumer(this.connectionUUID, this.hostUUID, body)
  }

  async Update(uuid: string, body: model.Consumer): Promise<model.Consumer> {
    return EditConsumer(this.connectionUUID, this.hostUUID, uuid, body)
  }

  async Delete(uuid: string): Promise<model.Consumer> {
    return DeleteConsumer(this.connectionUUID, this.hostUUID, uuid)
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    return await DeleteConsumerBulk(this.connectionUUID, this.hostUUID, uuids)
  }
}
