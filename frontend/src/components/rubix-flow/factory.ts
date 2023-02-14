import {
  AddWiresConnection,
  BulkDeleteWiresConnection,
  DownloadFlow,
  GetFlow, GetFlowByNodeType, GetFlowList, GetSubFlow,
  GetWiresConnection,
  GetWiresConnections,
  NodeHelp,
  NodeHelpByName,
  NodePallet,
  NodePayload,
  NodeSchema, NodesValuesInsideParent, NodesValuesSubFlow,
  NodeValue,
  NodeValues,
  UpdateWiresConnection,
} from "../../../wailsjs/go/backend/App";
import { backend, db, flowcli, node } from "../../../wailsjs/go/models";

export class FlowFactory {
  // arg1 is the connectionUUID
  // arg2 is hostUUID
  // arg3 is used when user is programming on flow localhost (as in running rubix-edge-wires backend on their PC)
  // set arg3 to true if its a remote connection

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

  // NodesValuesSubFlow get all the node current values from the runtime for a parent node with sub-flow inputs and outputs values
  async NodesValuesSubFlow(
    connUUID: string,
    hostUUID: string,
    parentID: string,
    isRemote: boolean
  ): Promise<Array<node.Values>> {
    return await NodesValuesSubFlow(connUUID, hostUUID, parentID, isRemote);
  }

  // NodesValuesInsideParent get all the node current values from the runtime for one parent
  async NodesValuesInsideParent(
    connUUID: string,
    hostUUID: string,
    parentID: string,
    isRemote: boolean
  ): Promise<Array<node.Values>> {
    return await NodesValuesInsideParent(connUUID, hostUUID, parentID, isRemote);
  }

  async NodesHelp(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean
  ): Promise<Array<node.Help>> {
    return await NodeHelp(connUUID, hostUUID, isRemote);
  }

  async NodeHelpByName(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    nodeName: string,
  ): Promise<backend.Help> {
    return await NodeHelpByName(connUUID, hostUUID, isRemote, nodeName);
  }


  async GetFlow(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean
  ): Promise<any> {
    return await GetFlow(connUUID, hostUUID, isRemote);
  }

  async GetFlowByNodeType(
    connUUID: string,
    hostUUID: string,
    nodeType: string,
    isRemote: boolean
  ): Promise<any> {
    return await GetFlowByNodeType(connUUID, hostUUID, nodeType, isRemote);
  }




  async GetSubFlow(
    connUUID: string,
    hostUUID: string,
    subFlowID: string,
    isRemote: boolean
  ): Promise<any> {
    return await GetSubFlow(connUUID, hostUUID, subFlowID, isRemote);
  }

  async GetFlowList(
    connUUID: string,
    hostUUID: string,
    nodeIDs: flowcli.NodesList,
    isRemote: boolean
  ): Promise<any> {
    return await GetFlowList(connUUID, hostUUID, nodeIDs, isRemote);
  }

  async NodePallet(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    category: string
  ) {

    return await NodePallet(connUUID, hostUUID, category, isRemote);
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

  async NodePayload(
    connUUID: string,
    hostUUID: string,
    isRemote: boolean,
    encodedNodes: any,
    nodeUUID: string
  ) : Promise<any>  {
    return await NodePayload(
      connUUID,
      hostUUID,
      isRemote,
      encodedNodes,
      nodeUUID
    );
  }

}


//
