import { GetBacnetFreeAddress, GetNodesAllFlowNetworks, NextFreeBacnetAddress } from "../../../wailsjs/go/backend/App";
import { backend } from "../../../wailsjs/go/models";

export class MappingFactory {

  async GetNodesAllFlowNetworks(connUUID: string, hostUUID: string, isRemote: boolean): Promise<any> {
    return await GetNodesAllFlowNetworks(connUUID, hostUUID, isRemote);
  }

  async GetBacnetFreeAddress(connUUID: string, hostUUID: string, isRemote: boolean): Promise<backend.BacnetPoints> {
    return await GetBacnetFreeAddress(connUUID, hostUUID, isRemote);
  }

  async NextFreeBacnetAddress(nums: Array<number>): Promise<number> {
    return await NextFreeBacnetAddress(nums);
  }
}
