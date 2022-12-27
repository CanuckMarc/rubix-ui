import { GetSchedules } from "../../../wailsjs/go/backend/App";

export class SchedulesFactory {
  async GetSchedules(connUUID: string, hostUUID: string): Promise<any> {
    return await GetSchedules(connUUID, hostUUID);
  }
}
