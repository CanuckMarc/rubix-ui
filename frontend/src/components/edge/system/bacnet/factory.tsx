import {
    BACnetWriteConfig,
    BACnetReadConfig,
  } from "../../../../../wailsjs/go/backend/App";
  import { assistcli } from "../../../../../wailsjs/go/models";

  export class BACnetFactory {
    public BACnetReadConfig(connUUID: string, hostUUID: string): Promise<assistcli.ConfigBACnetServer> {
        return BACnetReadConfig(connUUID, hostUUID);
    }
    public BACnetWriteConfig(connUUID: string, hostUUID: string, config: assistcli.ConfigBACnetServer) {
        return BACnetWriteConfig(connUUID, hostUUID, config);
    }
  }