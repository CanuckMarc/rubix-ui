// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {model} from '../models';
import {assist} from '../models';

export function AddHost(arg1:model.Host):Promise<model.Host>;

export function AddHostNetwork(arg1:model.Network):Promise<model.Network>;

export function DeleteHost(arg1:string):Promise<assist.Response>;

export function EditHost(arg1:string,arg2:model.Host):Promise<model.Host>;

export function GetHost(arg1:string):Promise<model.Host>;

export function GetHostNetworks():Promise<Array<model.Network>>;

export function GetHosts():Promise<Array<model.Host>>;
