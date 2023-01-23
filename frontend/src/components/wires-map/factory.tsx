import { GetNodesAllFlowNetworks } from "../../../wailsjs/go/backend/App";

export class MappingFactory {
    async GetNodesAllFlowNetworks(connUUID: string, hostUUID: string, isRemote: boolean): Promise<any> {
      return await GetNodesAllFlowNetworks(connUUID, hostUUID, isRemote);
    }
}