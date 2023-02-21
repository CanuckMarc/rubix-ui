import { backend, model, rumodel } from "../../../../../../../wailsjs/go/models";
import {
  DeleteFlowNetworkClone,
  DeleteFlowNetworkCloneBulk,
  GetFlowNetworkClone,
  GetFlowNetworkClones,
  SyncFlowNetworkClones,
} from "../../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}


export class FlowFrameworkNetworkCloneFactory {
  hostUUID!: string;
  connectionUUID!: string;

  async GetAll(withStream: boolean): Promise<Array<model.FlowNetworkClone>> {
    let resp: Promise<Array<model.FlowNetworkClone>> = {} as Promise<Array<model.FlowNetworkClone>>;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await GetFlowNetworkClones(this.connectionUUID, this.hostUUID, withStream).then(res => {
      resp = res as unknown as Promise<Array<model.FlowNetworkClone>>;
    }).catch(err => {
      return resp;
    });
    return resp;
  }

  async GetOne(uuid: string, withStream: boolean): Promise<model.FlowNetworkClone> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.FlowNetworkClone = {} as model.FlowNetworkClone;
    await GetFlowNetworkClone(this.connectionUUID, this.hostUUID, uuid, withStream).then(res => {
      resp = res as model.FlowNetworkClone;
    }).catch(err => {
      return resp;
    });
    return resp;
  }

  async Delete(uuid: string): Promise<model.FlowNetworkClone> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.FlowNetworkClone = {} as model.FlowNetworkClone;
    await DeleteFlowNetworkClone(this.connectionUUID, this.hostUUID, uuid).then(res => {
      resp = res as model.FlowNetworkClone;
    }).catch(err => {
      return resp;
    });
    return resp;
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: Promise<any> = {} as Promise<any>;
    await DeleteFlowNetworkCloneBulk(this.connectionUUID, this.hostUUID, uuids).then(res => {
      resp = res as Promise<any>;
    }).catch(err => {
      return resp;
    });
    return resp;
  }

  async Sync(): Promise<rumodel.Response> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return SyncFlowNetworkClones(this.connectionUUID, this.hostUUID);
  }
}
