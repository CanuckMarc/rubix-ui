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
  GitListReleases, LatestVersions
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

  async EdgeUnInstallApp(connUUID: string, hostUUID: string, appName: string): Promise<amodel.Message> {
    return await EdgeUnInstallApp(connUUID, hostUUID, appName);
  }

  async EdgeAppsInfo(connUUID: string, hostUUID: string) {
    return await EdgeAppsInfo(connUUID, hostUUID);
  }

  async EdgeServiceStart(connUUID: string, hostUUID: string, serviceName: string) {
    return await EdgeServiceStart(connUUID, hostUUID, serviceName);
  }

  async EdgeServiceStop(connUUID: string, hostUUID: string, serviceName: string) {
    return await EdgeServiceStop(connUUID, hostUUID, serviceName);
  }

  async EdgeServiceRestart(connUUID: string, hostUUID: string, serviceName: string) {
    return await EdgeServiceRestart(connUUID, hostUUID, serviceName);
  }

  async EdgeServiceAction(action: string, connUUID: string, hostUUID: string, serviceName: string, appName: string) {
    switch (action) {
      case "start":
        return this.EdgeServiceStart(connUUID, hostUUID, serviceName);
      case "stop":
        return this.EdgeServiceStop(connUUID, hostUUID, serviceName);
      case "restart":
        return this.EdgeServiceRestart(connUUID, hostUUID, serviceName);
      case "uninstall":
        return this.EdgeUnInstallApp(connUUID, hostUUID, appName);
    }
    return Promise.reject(null);
  }

  // gets all the latest version of nube software, assist, edge and FF
  async LatestVersions() {
    return await LatestVersions();
  }

}
