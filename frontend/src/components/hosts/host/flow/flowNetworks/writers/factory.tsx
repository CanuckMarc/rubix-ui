import { backend, model } from "../../../../../../../wailsjs/go/models";
import { CreateWriter, DeleteWritersBulk, EditWriter, GetConsumer } from "../../../../../../../wailsjs/go/backend/App";

export class WritersFactory {
  connectionUUID!: string;
  hostUUID!: string;
  consumerUUID!: string;

  async GetAll(): Promise<model.Consumer> {
    return await GetConsumer(this.connectionUUID, this.hostUUID, this.consumerUUID, true);
  }

  async Add(body: model.Writer): Promise<model.Writer> {
    return await CreateWriter(this.connectionUUID, this.hostUUID, body);
  }

  async Edit(uuid: string, body: model.Writer): Promise<model.Writer> {
    return await EditWriter(
      this.connectionUUID,
      this.hostUUID,
      uuid,
      body,
      false
    );
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<model.Writer> {
    return await DeleteWritersBulk(this.connectionUUID, this.hostUUID, uuids);
  }
}
