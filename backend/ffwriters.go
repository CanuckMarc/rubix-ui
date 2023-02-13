package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
)

func (inst *App) CreateWriter(connUUID, hostUUID string, body *model.Writer) *model.Writer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	resp, err := client.CreateWriter(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) GetWriters(connUUID, hostUUID string) []model.Writer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	resp, err := client.GetWriters(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.Writer{}
	}
	return resp
}

func (inst *App) EditWriter(connUUID, hostUUID, uuid string, body *model.Writer, updateProducer bool) *model.Writer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	resp, err := client.EditWriter(hostUUID, uuid, body, updateProducer)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) DeleteWriter(connUUID, hostUUID, uuid string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteWriter(hostUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteWritersBulk(connUUID, hostUUID string, UUIDs []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
	}
	var addedCount int
	var errorCount int
	for _, item := range UUIDs {
		_, err := client.DeleteWriter(hostUUID, item.UUID)
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
