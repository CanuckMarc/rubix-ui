import {main, model} from "../../../../../../../wailsjs/go/models";
import {
    AddFlowNetwork,
    DeleteFlowNetwork,
    DeleteFlowNetworkBulk,
    EditFlowNetwork,
    GetFlowNetwork,
    GetFlowNetworks,
} from "../../../../../../../wailsjs/go/main/App";
import {Helpers} from "../../../../../../helpers/checks";

function hasUUID(uuid: string): Error {
    return Helpers.IsUndefined(uuid, "host or connection uuid") as Error
}


export class FlowFrameworkNetworkFactory {
    hostUUID!: string;
    connectionUUID!: string;
    
    async GetAll(withStream: boolean): Promise<Array<model.FlowNetwork>> {
        let all: Promise<Array<model.FlowNetwork>> = {} as Promise<Array<model.FlowNetwork>>
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        await GetFlowNetworks(this.connectionUUID, this.hostUUID, withStream).then(res => {
            all = res as unknown as Promise<Array<model.FlowNetwork>>
        }).catch(err => {
            return undefined
        })
        return all
    }

    async GetOne(uuid:string, withStream: boolean): Promise<model.FlowNetwork> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.FlowNetwork = {} as model.FlowNetwork
        await GetFlowNetwork(this.connectionUUID, this.hostUUID, uuid, withStream).then(res => {
            resp = res as model.FlowNetwork
        }).catch(err => {
            return undefined
        })
        return resp
    }


    async Add(body: model.FlowNetwork): Promise<model.FlowNetwork> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.FlowNetwork = {} as model.FlowNetwork
        await AddFlowNetwork(this.connectionUUID, this.hostUUID, body).then(res => {
            resp = res as model.FlowNetwork
        }).catch(err => {
            return undefined
        })
        return resp
    }

    async Update(uuid:string, body: model.FlowNetwork): Promise<model.FlowNetwork> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let resp: model.FlowNetwork = {} as model.FlowNetwork
        await EditFlowNetwork(this.connectionUUID, this.hostUUID, uuid, body).then(res => {
            resp = res as model.FlowNetwork
        }).catch(err => {
            return undefined
        })
        return resp
    }

    async Delete(uuid:string): Promise<model.FlowNetwork> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
           let resp: model.FlowNetwork = {} as model.FlowNetwork
        await DeleteFlowNetwork(this.connectionUUID, this.hostUUID, uuid).then(res => {
            resp = res as model.FlowNetwork
        }).catch(err => {
            return undefined
        })
        return resp
    }

    async BulkDelete(uuids: Array<main.UUIDs>): Promise<any> {
        hasUUID(this.connectionUUID)
        hasUUID(this.hostUUID)
        let out: Promise<any> = {} as Promise<any>
        await DeleteFlowNetworkBulk(this.connectionUUID, this.hostUUID, uuids).then(res => {
            out = res as Promise<any>
        }).catch(err => {
            return undefined
        })
        return out
    }


}