import { amodel, store, } from "../../../wailsjs/go/models";
import {
  EdgeAppsInfo,
  EdgeServiceRestart,
  EdgeServiceStart,
  EdgeServiceStop,
  EdgeUnInstallApp,
  GetRelease,
  GetReleases,
  GitDownloadRelease,
  GitListReleases
} from "../../../wailsjs/go/backend/App";

export class ReleasesFactory {
  // list all the GitHub version to the user
  async GitReleases(token: string): Promise<Array<store.ReleaseList>> {
    return await GitListReleases(token);
  }

  // download the selected version by the user from GitHub
  async GitDownloadRelease(
    token: string,
    version: string
  ): Promise<store.Release> {
    return await GitDownloadRelease(token, version);
  }

  /*
  INSTALL A APP ON THE HOST (via rubix-assist via rubix-edge)
  */

  // let the user select a release that has been downloaded already on their PC (in local db)
  async GetReleases(): Promise<Array<store.Release>> {
    return await GetReleases();
  }

  async GetRelease(uuid: string): Promise<store.Release> {
    return await GetRelease(uuid);
  }

  async EdgeUnInstallApp(
    connUUID: string,
    hostUUID: string,
    appName: string
  ): Promise<amodel.Message> {
    return await EdgeUnInstallApp(connUUID, hostUUID, appName);
  }

  async EdgeAppsInfo(connUUID: string, hostUUID: string) {
    return await EdgeAppsInfo(connUUID, hostUUID);
  }

  async EdgeServiceStart(connUUID: string, hostUUID: string, appName: string) {
    return await EdgeServiceStart(connUUID, hostUUID, appName);
  }

  async EdgeServiceStop(connUUID: string, hostUUID: string, appName: string) {
    return await EdgeServiceStop(connUUID, hostUUID, appName);
  }

  async EdgeServiceRestart(
    connUUID: string,
    hostUUID: string,
    appName: string
  ) {
    return await EdgeServiceRestart(connUUID, hostUUID, appName);
  }

  async EdgeServiceAction(
    action: string,
    payload: { connUUID: string; hostUUID: string; appName: string }
  ) {
    switch (action) {
      case "start":
        return this.EdgeServiceStart(
          payload.connUUID,
          payload.hostUUID,
          payload.appName
        );

      case "stop":
        return this.EdgeServiceStop(
          payload.connUUID,
          payload.hostUUID,
          payload.appName
        );

      case "restart":
        return this.EdgeServiceRestart(
          payload.connUUID,
          payload.hostUUID,
          payload.appName
        );

      case "uninstall":
        return this.EdgeUnInstallApp(
          payload.connUUID,
          payload.hostUUID,
          payload.appName
        );
    }
    return Promise.reject(null);
  }
}
