import {
  CSAddDevice,
  CSDeleteDevice, CSDeviceOTAKeys,
  CSEditDevice,
  CSGetApplications,
  CSGetDevice,
  CSGetDeviceProfiles,
  CSGetDevices, CSGetGateway,
} from "../../../wailsjs/go/backend/App";
import { chirpstack } from "../../../wailsjs/go/models";


export class ChirpFactory {


  async CSGetApplications(connUUID: string, hostUUID: string): Promise<chirpstack.Applications> {
    return await CSGetApplications(connUUID, hostUUID);
  }

  async CSGetDeviceProfiles(connUUID: string, hostUUID: string): Promise<chirpstack.DeviceProfiles> {
    return await CSGetDeviceProfiles(connUUID, hostUUID);
  }

  async CSGetDevices(connUUID: string, hostUUID: string, applicationID: string): Promise<chirpstack.Devices> {
    return await CSGetDevices(connUUID, hostUUID, applicationID);
  }

  async CSGetDevice(connUUID: string, hostUUID: string, devEui: string): Promise<chirpstack.Device> {
    return await CSGetDevice(connUUID, hostUUID, devEui);
  }

  async CSAddDevice(connUUID: string, hostUUID: string, body: chirpstack.Device): Promise<chirpstack.Device> {
    return await CSAddDevice(connUUID, hostUUID, body);
  }

  async CSEditDevice(connUUID: string, hostUUID: string, devEui: string, body: chirpstack.Device): Promise<chirpstack.Device> {
    return await CSEditDevice(connUUID, hostUUID, devEui, body);
  }

  async CSDeleteDevice(connUUID: string, hostUUID: string, devEui: string): Promise<boolean> {
    return await CSDeleteDevice(connUUID, hostUUID, devEui);
  }

  async CSDeviceOTAKeys(connUUID: string, hostUUID: string, devEui: string, key: string): Promise<chirpstack.DeviceKey> {
    return await CSDeviceOTAKeys(connUUID, hostUUID, devEui, key);
  }

  async CSGetGateway(connUUID: string, hostUUID: string): Promise<chirpstack.GatewaysResult> {
    return await CSGetGateway(connUUID, hostUUID);
  }

}
