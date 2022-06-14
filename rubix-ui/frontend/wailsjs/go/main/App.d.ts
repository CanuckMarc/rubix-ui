// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {assitcli} from '../models';
import {model} from '../models';

export function DeleteLocation(arg1:string):Promise<assitcli.Response>;

export function EditHostNetwork(arg1:string,arg2:model.Network):Promise<model.Network>;

export function GetHost(arg1:string):Promise<model.Host>;

export function GetLocations():Promise<Array<model.Location>>;

export function GetLocation(arg1:string):Promise<model.Location>;

export function EditHost(arg1:string,arg2:model.Host):Promise<model.Host>;

export function EditHost(arg1:string,arg2:model.Host):Promise<model.Host>;

export function GetHostNetworks():Promise<Array<model.Network>>;

export function GetNetworkSchema():Promise<any>;

export function UpdateLocation(arg1:string,arg2:model.Location):Promise<model.Location>;

export function AddLocation(arg1:model.Location):Promise<model.Location>;

export function DeleteHost(arg1:string):Promise<assitcli.Response>;

export function GetHostNetwork(arg1:string):Promise<model.Network>;

export function GetHostSchema():Promise<any>;

export function GetLocationSchema():Promise<any>;

export function GetLocations():Promise<Array<model.Location>>;

export function AddHost(arg1:model.Host):Promise<model.Host>;

export function DeleteHostNetwork(arg1:string):Promise<assitcli.Response>;
