import { backend, model } from "../../../../../../../wailsjs/go/models";
import {
  AddProducer,
  DeleteProducer,
  DeleteProducerBulk,
  EditProducer, EditProducerHistory, GetProducerByThingUUID,
  GetStream,
} from "../../../../../../../wailsjs/go/backend/App";

export class FlowProducerFactory {
  hostUUID!: string;
  connectionUUID!: string;
  streamUUID!: string;

  async GetAll(withProducers: boolean, withWriterClones: boolean): Promise<Array<model.Producer>> {
    const res = await GetStream(this.connectionUUID, this.hostUUID, this.streamUUID, withProducers, withWriterClones);
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


  //GetProducerByThingUUID for the thingUUID for example pass in the pointUUID
  async GetProducerByThingUUID(connUUID: string, hostUUID: string, thingUUID: string): Promise<model.Producer> {
    return await GetProducerByThingUUID(connUUID, hostUUID, thingUUID);
  }

  //EditProducerHistory
  // valid type historyType
  // historyTypeCov            string = "COV"
  // historyTypeInterval       string = "INTERVAL"
  // historyTypeCovAndInterval string = "COV_AND_INTERVAL"


  async EditProducerHistory(connUUID: string, hostUUID: string, pointUUID: string, historyType: string, historyEnable: boolean, interval: number): Promise<model.Producer> {
    return await EditProducerHistory(connUUID, hostUUID, pointUUID, historyType, historyEnable, interval);
  }

}
