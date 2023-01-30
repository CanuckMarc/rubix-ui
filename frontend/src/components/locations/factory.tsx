import {
  DeleteLocationBulk,
  GetLocation,
  GetLocations,
  GetLocationSchema,
} from "../../../wailsjs/go/backend/App";
import { Helpers } from "../../helpers/checks";
import { backend, amodel } from "../../../wailsjs/go/models";

function hasUUID(uuid: string): Error {
  return Helpers.IsUndefined(uuid, "Location or connection uuid") as Error;
}

export class LocationFactory {
  uuid!: string;
  connectionUUID!: string;
  private _this!: amodel.Location;
  private count!: number;
  private _all!: Array<amodel.Location>;

  get all(): Array<amodel.Location> {
    return this._all;
  }

  set all(value: Array<amodel.Location>) {
    this._all = value;
  }

  get this(): amodel.Location {
    return this._this;
  }

  set this(value: amodel.Location) {
    this._this = value;
  }

  public GetTotalCount(): number {
    return this.count;
  }

  async Schema(): Promise<any> {
    const resp = await GetLocationSchema(this.connectionUUID)
    return JSON.parse(resp || "{}");
  }

  async GetAll(): Promise<Array<amodel.Location>> {
    let all: Array<amodel.Location> = {} as Array<amodel.Location>;
    await GetLocations(this.connectionUUID)
      .then((res) => {
        all = res as Array<amodel.Location>;
        this.all = all;
      })
      .catch((err) => {
        return undefined;
      });
    return all;
  }

  async GetOne(): Promise<amodel.Location> {
    hasUUID(this.uuid);
    let one: amodel.Location = {} as amodel.Location;
    await GetLocation(this.connectionUUID, this.uuid)
      .then((res) => {
        one = res as amodel.Location;
        this._this = one;
      })
      .catch((err) => {
        return undefined;
      });
    return one;
  }

  async BulkDelete(uuids: Array<backend.UUIDs>): Promise<any> {
    hasUUID(this.connectionUUID);
    let out: Promise<any> = {} as Promise<any>;
    await DeleteLocationBulk(this.connectionUUID, uuids)
      .then((res: any) => {
        out = res as Promise<any>;
      })
      .catch((err: any) => {
        return undefined;
      });
    return out;
  }
}
