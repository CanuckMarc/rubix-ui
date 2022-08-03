import {main, model} from "../../../../../../wailsjs/go/models";
import {
    AddDevice,
    AddPoint, DeleteDeviceBulk,
    DeletePoint, DeletePointBulk,
    EditPoint, GetFlowNetworkSchema, GetFlowPointSchema,
    GetPoint, GetPoints, GetPointsForDevice,
} from "../../../../../../wailsjs/go/main/App";
import {Helpers} from "../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
    return Helpers.IsUndefined(uuid, "host or connection uuid") as Error
}


export class FlowPointFactory {
    hostUUID!: string;
    connectionUUID!: string;

    async GetAll(): Promise<Array<model.Point>> {
        let resp: Promise<Array<model.Point>> = {} as Promise<Array<model.Point>>
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        await GetPoints(this.connectionUUID, this.hostUUID).then(res => {
            resp = res as unknown as Promise<Array<model.Point>>
        }).catch(err => {
            return resp
        })
        return resp
    }

    async GetPointsForDevice(deviceUUID: string): Promise<Array<model.Point>> {
        let resp: Promise<Array<model.Point>> = {} as Promise<Array<model.Point>>
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        await GetPointsForDevice(this.connectionUUID, this.hostUUID, deviceUUID).then(res => {
            resp = res as unknown as Promise<Array<model.Point>>
        }).catch(err => {
            return resp
        })
        return resp
    }

    async GetOne(uuid:string): Promise<model.Point> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.Point = {} as model.Point
        await GetPoint(this.connectionUUID, this.hostUUID, uuid).then(res => {
            resp = res as model.Point
        }).catch(err => {
            return resp
        })
        return resp
    }

    async Add(deviceUUID:string, body:model.Point): Promise<model.Point> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.Point = {} as model.Point
        body.device_uuid = deviceUUID
        await AddPoint(this.connectionUUID, this.hostUUID, body).then(res => {
            resp = res as model.Point
        }).catch(err => {
            return resp
        })
        return resp
    }


    async Update(uuid:string, body:model.Point): Promise<model.Point> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.Point = {} as model.Point
        await EditPoint(this.connectionUUID, this.hostUUID, uuid, body).then(res => {
            resp = res as model.Point
        }).catch(err => {
            return resp
        })
        return resp
    }

    async Delete(uuid:string): Promise<model.Point> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.Point = {} as model.Point
        await DeletePoint(this.connectionUUID, this.hostUUID, uuid).then(res => {
            resp = res as model.Point
        }).catch(err => {
            return resp
        })
        return resp
    }

    async BulkDelete(uuids: Array<main.UUIDs>): Promise<any> {
        let resp: Promise<any> = {} as Promise<any>
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        await DeletePointBulk(this.connectionUUID, this.hostUUID, uuids).then(res => {
            resp = res as Promise<any>
        }).catch(err => {
            return resp
        })
        return resp
    }

    async Schema(connUUID:string, hostUUID:string, setPluginName:string):Promise<any> {
        let resp: Promise<any> = {} as Promise<any>
        hasUUID(connUUID)
        hasUUID(hostUUID)
        await GetFlowPointSchema(connUUID, hostUUID, setPluginName).then(res => {
            res.plugin_name = setPluginName;
            resp = res as unknown as Promise<any>
        }).catch(err => {
            return resp
        })
        return resp
    }
}
