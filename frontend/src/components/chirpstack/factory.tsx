import { CSGetDevices, } from "../../../wailsjs/go/backend/App";
import { chirpstack } from "../../../wailsjs/go/models";


export class ChirpFactory {

  async CSGetDevices(connUUID: string, hostUUID: string, applicationID: string): Promise<chirpstack.Devices> {
    return await CSGetDevices(connUUID, hostUUID, applicationID);
  }

}
