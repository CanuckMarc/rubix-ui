import { GetBacnetFreeAddress, GetNodesAllFlowNetworks, NextFreeBacnetAddress, GetBacnetNodes } from "../../../wailsjs/go/backend/App";
import { node, backend } from "../../../wailsjs/go/models";

export class MappingFactory {

  async GetNodesAllFlowNetworks(connUUID: string, hostUUID: string, isRemote: boolean): Promise<any> {
    return await GetNodesAllFlowNetworks(connUUID, hostUUID, isRemote);
  }

  async GetBacnetNodes(connUUID: string, hostUUID: string, isRemote: boolean): Promise<Array<node.Schema>> {
    return await GetBacnetNodes(connUUID, hostUUID, isRemote);
  }

  async GetBacnetFreeAddress(connUUID: string, hostUUID: string, isRemote: boolean): Promise<backend.BacnetPoints> {
    return await GetBacnetFreeAddress(connUUID, hostUUID, isRemote);
  }

  async NextFreeBacnetAddress(nums: Array<number>): Promise<number> {
    return await NextFreeBacnetAddress(nums);
  }
}
