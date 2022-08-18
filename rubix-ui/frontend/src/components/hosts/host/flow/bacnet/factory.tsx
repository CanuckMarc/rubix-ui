import {model} from "../../../../../../wailsjs/go/models";
import {BacnetWhois, GetBacnetDevicePoints} from "../../../../../../wailsjs/go/main/App";


export class BacnetFactory {
    hostUUID!: string;
    connectionUUID!: string;


  async Whois(bacnetNetworkUUID:string, pluginName:string): Promise<Array<model.Device>> {
    return await BacnetWhois(this.connectionUUID, this.hostUUID, bacnetNetworkUUID, pluginName);
  }

  async DiscoverDevicePoints(deviceUUID:string, addPoints:boolean, makeWriteable:boolean): Promise<Array<model.Point>> {
    return await GetBacnetDevicePoints(this.connectionUUID, this.hostUUID, deviceUUID, addPoints, makeWriteable);
  }


}
