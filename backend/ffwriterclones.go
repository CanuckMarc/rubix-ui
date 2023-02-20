package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

func (inst *App) GetWriterClones(connUUID, hostUUID string) []model.WriterClone {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	resp, err := client.GetWriterClones(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.WriterClone{}
	}
	return resp
}

func (inst *App) DeleteWriterClone(connUUID, hostUUID, uuid string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteWriterClone(hostUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteWriterCloneBulk(connUUID, hostUUID string, UUIDs []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiSuccessMessage(err)
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range UUIDs {
		_, err := client.DeleteStreamClone(hostUUID, item.UUID)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(err)
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("delete count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to delete count: %d", errorCount))
	}
	return nil
}

func (inst *App) SyncWriterClones(connUUID, hostUUID, producerUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, err = client.SyncWriterClones(hostUUID, producerUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse("synced writer-clones")
}
