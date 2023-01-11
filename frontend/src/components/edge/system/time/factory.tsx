import {
  EdgeGetTimeZoneList,
  EdgeUpdateSystemTime,
  EdgeUpdateTimezone,
  GetHostTime,
  EdgeNTPEnable
} from "../../../../../wailsjs/go/backend/App";
import {Helpers} from "../../../../helpers/checks";
import {datelib, system} from "../../../../../wailsjs/go/models";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "get host time has uuid") as Error;
}

export class HostTimeFactory {
  connectionUUID!: string;
  hostUUID!: string;

  private callTime(): Promise<any> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return GetHostTime(this.connectionUUID, this.hostUUID);
  }

  public GetHostTime(): Promise<any> {
    return this.callTime();
  }

  public EdgeGetTimeZoneList(connectionUUID: string, hostUUID: string): Promise<Array<string>> {
    return EdgeGetTimeZoneList(connectionUUID, hostUUID);
  }

  public EdgeUpdateTimezone(connectionUUID: string, hostUUID: string, timeZone: string): Promise<system.Message> {
    return EdgeUpdateTimezone(connectionUUID, hostUUID, timeZone);
  }
  
  public EdgeUpdateSystemTime(connectionUUID: string, hostUUID: string, timeString: string): Promise<datelib.Time> {
    return EdgeUpdateSystemTime(connectionUUID, hostUUID, timeString);
  }

  public EdgeNTPEnable(connUUID: string, hostUUID: string): Promise<system.Message> {
    return EdgeNTPEnable(connUUID, hostUUID);
  }
  
}
