package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	log "github.com/sirupsen/logrus"
)

func (inst *App) EdgeGetSnapshots(connUUID, hostUUID string) []assistcli.Snapshots {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeGetSnapshots(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) EdgeGetSnapshotsCreateLogs(connUUID, hostUUID string) []assistcli.SnapshotCreateLog {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeGetSnapshotsCreateLogs(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) EdgeGetSnapshotsRestoreLogs(connUUID, hostUUID string) []assistcli.SnapshotRestoreLog {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeGetSnapshotsRestoreLogs(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) EdgeCreateSnapshot(connUUID, hostUUID string) *assistcli.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeCreateSnapshot(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) EdgeRestoreSnapshot(connUUID, hostUUID, fileName string) *assistcli.Message {
	// client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	// if err != nil {
	// 	return nil
	// }
	// resp, err := client.EdgeRestoreSnapshot(hostUUID, fileName)
	// if err != nil {
	// 	inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
	// 	return nil
	// }
	// return resp
	log.Error("RESTORE SNAPSHOT ADD ME IN", connUUID, hostUUID, fileName)
	return nil
}

func (inst *App) EdgeDeleteSnapshot(connUUID, hostUUID, fileName string) *assistcli.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeDeleteSnapshot(hostUUID, fileName)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}
