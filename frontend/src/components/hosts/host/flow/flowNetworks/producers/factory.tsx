import { backend, model } from "../../../../../../../wailsjs/go/models";
import {
  AddProducer,
  DeleteProducer,
  DeleteProducerBulk,
  EditProducer,
  GetStream,
} from "../../../../../../../wailsjs/go/backend/App";

export class FlowProducerFactory {
  hostUUID!: string;
  connectionUUID!: string;
  streamUUID!: string;

  async GetAll(): Promise<Array<model.Producer>> {
    const res = await GetStream(this.connectionUUID, this.hostUUID, this.streamUUID);
    return res.producers || [];
  }

  async Add(body: model.Producer): Promise<model.Producer> {
    return await AddProducer(this.connectionUUID, this.hostUUID, body);
  }

  async Update(uuid: string, body: model.Producer): Promise<model.Producer> {
    return await EditProducer(this.connectionUUID, this.hostUUID, uuid, body);
  }

  async Delete(uuid: string): Promise<model.Producer> {
    return await DeleteProducer(this.connectionUUID, this.hostUUID, uuid);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    return await DeleteProducerBulk(this.connectionUUID, this.hostUUID, uuids);
  }
}
