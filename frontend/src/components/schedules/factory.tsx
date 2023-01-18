import {AddSchedule, DeleteSchedule, EditSchedule, GetSchedule, GetSchedules} from "../../../wailsjs/go/backend/App";
import {assistcli, model} from "../../../wailsjs/go/models";

export class SchedulesFactory {
  async GetSchedules(connUUID: string, hostUUID: string): Promise<any> {
    return await GetSchedules(connUUID, hostUUID);
  }

  async GetSchedule(connUUID: string, hostUUID: string, uuid: string): Promise<any> {
    return await GetSchedule(connUUID, hostUUID, uuid);
  }

  async AddSchedules(connUUID: string, hostUUID: string, body: assistcli.Schedule): Promise<any> {
    return await AddSchedule(connUUID, hostUUID, body);
  }

  async EditSchedule(connUUID: string, hostUUID: string, uuid: string, body: assistcli.Schedule): Promise<any> {
    return await EditSchedule(connUUID, hostUUID, uuid, body);
  }

  async DeleteSchedule(connUUID: string, hostUUID: string, uuid: string): Promise<any> {
    return await DeleteSchedule(connUUID, hostUUID, uuid);
  }
}
