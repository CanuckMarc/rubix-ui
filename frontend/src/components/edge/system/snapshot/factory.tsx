import {
  EdgeCreateSnapshot,
  EdgeGetSnapshots,
  EdgeGetSnapshotsCreateLogs,
  EdgeRestoreSnapshot
} from "../../../../../wailsjs/go/backend/App";

import { assistcli } from "../../../../../wailsjs/go/models";


export class SnapShotFactory {

  public EdgeGetSnapshots(connUUID: string, hostUUID: string): Promise<Array<assistcli.Snapshots>> {
    return EdgeGetSnapshots(connUUID, hostUUID);
  }

  public EdgeGetSnapshotsCreateLogs(connUUID: string, hostUUID: string): Promise<Array<assistcli.SnapshotCreateLog>> {
    return EdgeGetSnapshotsCreateLogs(connUUID, hostUUID);
  }

  public EdgeCreateSnapshot(connUUID: string, hostUUID: string): Promise<assistcli.Message> {
    return EdgeCreateSnapshot(connUUID, hostUUID);
  }

  public EdgeRestoreSnapshot(connUUID: string, hostUUID: string, name: string): Promise<assistcli.Message> {
    return EdgeRestoreSnapshot(connUUID, hostUUID, name);
  }

}
