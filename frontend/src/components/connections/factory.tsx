import { Helpers } from "../../helpers/checks";
import { backend, rumodel, storage } from "../../../wailsjs/go/models";
import {
  AddConnection,
  DeleteConnectionBulk,
  ExportConnection,
  GetConnections,
  GetConnectionSchema,
  UpdateConnection,
} from "../../../wailsjs/go/backend/App";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "connection uuid") as Error;
}

export class ConnectionFactory {
  uuid!: string;
  private count!: number;
  private _this!: storage.RubixConnection;

  get this(): storage.RubixConnection {
    return this._this;
  }

  set this(value: storage.RubixConnection) {
    this._this = value;
  }

  public GetTotalCount(): number {
    return this.count;
  }

  // pass in the connection UUIDs to do a backup to users PC
  async ExportConnection(uuids: Array<string>): Promise<any> {
    return await ExportConnection(uuids);
  }

  async Schema(): Promise<backend.ConnectionSchema> {
    return await GetConnectionSchema()
  }

  async GetAll(): Promise<Array<storage.RubixConnection>> {
    return await GetConnections()
  }

  async Add(): Promise<rumodel.Response> {
    return await AddConnection(this._this)
  }

  async Update(): Promise<rumodel.Response> {
    hasUUID(this.uuid);
    return await UpdateConnection(this.uuid, this._this)
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    return await DeleteConnectionBulk(uuids)
  }
}
