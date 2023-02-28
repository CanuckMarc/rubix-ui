import { backend, model, rumodel } from "../../../../../../../wailsjs/go/models";
import {
  DeleteWriterCloneBulk, GetProducer, SyncWriterClones,
} from "../../../../../../../wailsjs/go/backend/App";

import WriterClone = model.WriterClone;

export class WriterClonesFactory {
  hostUUID!: string;
  connectionUUID!: string;
  producerUUID!: string;

  async GetAll(): Promise<model.Producer> {
    return await GetProducer(this.connectionUUID, this.hostUUID, this.producerUUID, true);
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<WriterClone> {
    return await DeleteWriterCloneBulk(this.connectionUUID, this.hostUUID, uuids);
  }

  async Sync(producerUUID: string): Promise<rumodel.Response> {
    return SyncWriterClones(this.connectionUUID, this.hostUUID, producerUUID);
  }
}
