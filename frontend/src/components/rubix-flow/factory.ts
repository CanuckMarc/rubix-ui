import {
  AddWiresConnection,
  BulkDeleteWiresConnection,
  DeleteWiresConnection,
  DownloadFlow,
  GetFlow,
  GetWiresConnection,
  GetWiresConnections,
  NodePallet,
  NodeSchema,
  NodeValue,
  NodeValues,
  UpdateWiresConnection, WiresHelp,
} from "../../../wailsjs/go/backend/App";
import { db, node } from "../../../wailsjs/go/models";

export class FlowFactory {
  // arg1 is the connectionUUID
  // arg2 is hostUUID
  // arg3 is used when user is programming on flow localhost (as in running rubix-edge-wires backend on their PC)
  // set arg3 to true if its a remote connection


  async WiresHelp():Promise<string> {
    return await WiresHelp();
  }

  async BulkDeleteWiresConnection(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    uuids: Array<string>
  ): Promise<any> {
    return await BulkDeleteWiresConnection(connUUID, hostUUID, isRemote, uuids);
  }

  async GetWiresConnections(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean
  ): Promise<Array<db.Connection>> {
    return await GetWiresConnections(connUUID, hostUUID, isRemote);
  }

  async GetWiresConnection(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    uuid: string
  ): Promise<db.Connection> {
    return await GetWiresConnection(connUUID, hostUUID, isRemote, uuid);
  }


  async UpdateWiresConnection(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    uuid: string,
    body: db.Connection
  ): Promise<db.Connection> {
    return await UpdateWiresConnection(
      connUUID,
      hostUUID,
      isRemote,
      uuid,
      body
    );
  }

  async AddWiresConnection(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    body: db.Connection
  ): Promise<db.Connection> {
    return await AddWiresConnection(connUUID, hostUUID, isRemote, body);
  }

  async NodeValue(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    nodeUUID: string
  ): Promise<node.Values> {
    return await NodeValue(connUUID, hostUUID, isRemote, nodeUUID);
  }

  async NodeSchema(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    nodeName: string
  ) {
    return await NodeSchema(connUUID, hostUUID, isRemote, nodeName);
  }

  async NodeValues(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean
  ): Promise<Array<node.Values>> {
    return await NodeValues(connUUID, hostUUID, isRemote);
  }

  async GetFlow(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean
  ): Promise<any> {
    return await GetFlow(connUUID, hostUUID, isRemote);
  }

  async NodePallet(connUUID: string, hostUUID: string, isRemote: boolean) {
    return await NodePallet(connUUID, hostUUID, isRemote);
  }

  async DownloadFlow(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    encodedNodes: any,
    restartFlow: boolean
  ) {
    return await DownloadFlow(
      connUUID,
      hostUUID,
      isRemote,
      encodedNodes,
      restartFlow
    );
  }
}
