import {assistcli, model} from "../../../../../../wailsjs/go/models";
import {BacnetMasterWhois, BacnetWhois, GetBacnetDevicePoints} from "../../../../../../wailsjs/go/backend/App";


export class BacnetFactory {
    hostUUID!: string;
    connectionUUID!: string;


  async Whois(bacnetNetworkUUID:string, pluginName:string): Promise<Array<model.Device>> {
    return await BacnetWhois(this.connectionUUID, this.hostUUID, bacnetNetworkUUID, pluginName);
  }

  async BacnetMasterWhois(bacnetNetworkUUID:string, opts:assistcli.WhoIsOpts): Promise<Array<model.Device>> {
    return await BacnetMasterWhois(this.connectionUUID, this.hostUUID, bacnetNetworkUUID, opts);
  }

  async DiscoverDevicePoints(deviceUUID:string, addPoints:boolean, makeWriteable:boolean): Promise<Array<model.Point>> {
    return await GetBacnetDevicePoints(this.connectionUUID, this.hostUUID, deviceUUID, addPoints, makeWriteable);
  }


}
