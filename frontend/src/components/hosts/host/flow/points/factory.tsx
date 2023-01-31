import {
  backend,
  model,
  storage,
  store, system,
} from "../../../../../../wailsjs/go/models";
import {
  AddPoint,
  AddPointsBulk,
  DeletePoint,
  DeletePointBulk,
  EditPoint,
  ExportPointBulk,
  GetFlowPointSchema,
  GetPoint, GetPointListPayload, GetPointPriority,
  GetPoints,
  GetPointsForDevice,
  ImportPointBulk,
  WritePointValue,
} from "../../../../../../wailsjs/go/backend/App";
import { Helpers } from "../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "host or connection uuid") as Error;
}

export class FlowPointFactory {
  hostUUID!: string;
  connectionUUID!: string;


  async GetPointListPayload(connectionUUID: string, hostUUID: string): Promise<Array<backend.PointListPayload>> {
    return GetPointListPayload(connectionUUID, hostUUID);
  }

  async GetAll(): Promise<Array<model.Point>> {
    let resp: Promise<Array<model.Point>> = {} as Promise<Array<model.Point>>;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await GetPoints(this.connectionUUID, this.hostUUID)
      .then((res) => {
        resp = res as unknown as Promise<Array<model.Point>>;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async GetPointsForDevice(deviceUUID: string): Promise<Array<model.Point>> {
    let resp: Promise<Array<model.Point>> = {} as Promise<Array<model.Point>>;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await GetPointsForDevice(this.connectionUUID, this.hostUUID, deviceUUID)
      .then((res) => {
        resp = res as unknown as Promise<Array<model.Point>>;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async GetOne(uuid: string): Promise<model.Point> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.Point = {} as model.Point;
    await GetPoint(this.connectionUUID, this.hostUUID, uuid)
      .then((res) => {
        resp = res as model.Point;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async Add(deviceUUID: string, body: model.Point): Promise<model.Point> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.Point = {} as model.Point;
    body.device_uuid = deviceUUID;
    await AddPoint(this.connectionUUID, this.hostUUID, body)
      .then((res) => {
        resp = res as model.Point;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async Update(uuid: string, body: model.Point): Promise<model.Point> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.Point = {} as model.Point;
    await EditPoint(this.connectionUUID, this.hostUUID, uuid, body)
      .then((res) => {
        resp = res as model.Point;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async Delete(uuid: string): Promise<model.Point> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    let resp: model.Point = {} as model.Point;
    await DeletePoint(this.connectionUUID, this.hostUUID, uuid)
      .then((res) => {
        resp = res as model.Point;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    let resp: Promise<any> = {} as Promise<any>;
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    await DeletePointBulk(this.connectionUUID, this.hostUUID, uuids)
      .then((res) => {
        resp = res as Promise<any>;
      })
      .catch((err) => {
        return resp;
      });
    return resp;
  }

  async AddBulk(points: Array<model.Point>) {
    return AddPointsBulk(this.connectionUUID, this.hostUUID, points);
  }

  async Schema(
    connUUID: string,
    hostUUID: string,
    setPluginName: string
  ): Promise<any> {
    hasUUID(connUUID);
    hasUUID(hostUUID);
    const resp = await GetFlowPointSchema(connUUID, hostUUID, setPluginName);
    const res = JSON.parse(resp || "{}");
    res.plugin_name = setPluginName;
    return res;
  }

  async BulkImport(
    backupUUID: string,
    deviceUUID: string
  ): Promise<backend.BulkAddResponse> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await ImportPointBulk(
      this.connectionUUID,
      this.hostUUID,
      backupUUID,
      deviceUUID
    );
  }

  async BulkExport(
    userComment: string,
    deviceUUID: string,
    uuids: Array<string>
  ): Promise<storage.Backup> {
    hasUUID(this.connectionUUID);
    hasUUID(this.hostUUID);
    return await ExportPointBulk(
      this.connectionUUID,
      this.hostUUID,
      userComment,
      deviceUUID,
      uuids
    );
  }

  async WritePointValue(
    pointUUID: string,
    body: model.Priority
  ): Promise<model.Point> {
    return await WritePointValue(
      this.connectionUUID,
      this.hostUUID,
      pointUUID,
      body
    );
  }

  async GetPointPriority(
    pointUUID: string,
  ): Promise<model.Point> {
    return await GetPointPriority(
      this.connectionUUID,
      this.hostUUID,
      pointUUID,
    );
  }
}
