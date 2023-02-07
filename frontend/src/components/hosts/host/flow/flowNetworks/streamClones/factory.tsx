import { backend, model } from "../../../../../../../wailsjs/go/models";
import {
  DeleteStreamBulkClones, GetFlowNetworkClone,
} from "../../../../../../../wailsjs/go/backend/App";

import UUIDs = backend.UUIDs;

export class FlowStreamCloneFactory {
  hostUUID!: string;
  connectionUUID!: string;
  flowNetworkCloneUUID!: string;

  async GetAll(): Promise<model.FlowNetworkClone> {
    return GetFlowNetworkClone(this.connectionUUID, this.hostUUID, this.flowNetworkCloneUUID, true)
  }

  async BulkDelete(uuids: Array<UUIDs>): Promise<any> {
    return DeleteStreamBulkClones(this.connectionUUID, this.hostUUID, uuids)
  }
}
