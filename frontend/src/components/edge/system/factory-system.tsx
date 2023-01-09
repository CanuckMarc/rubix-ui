
import {EdgeHostReboot} from "../../../../wailsjs/go/backend/App";
import {system} from "../../../../wailsjs/go/models";



export class HostSystemFactory {

  public EdgeHostReboot(connectionUUID: string, hostUUID: string): Promise<system.Message> {
    return EdgeHostReboot(connectionUUID, hostUUID);
  }

}
