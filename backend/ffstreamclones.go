package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

func (inst *App) GetStreamClone(connUUID, hostUUID, streamCloneUUID string, withConsumer, withWriters bool) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	streamClone, err := client.GetStreamClone(hostUUID, streamCloneUUID, withConsumer, withWriters)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(streamClone)
}

func (inst *App) GetProducersUnderStreamClone(connUUID, hostUUID, streamCloneUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	streamClone, err := client.GetStreamClone(hostUUID, streamCloneUUID, false, false)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	fnc, err := client.GetFlowNetworkClone(hostUUID, streamClone.FlowNetworkCloneUUID, false)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	resp, err := client.GetStreamFromFNC(hostUUID, fnc.UUID, streamClone.SourceUUID, true, false)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return inst.successResponse(resp)
}

func (inst *App) DeleteStreamClone(connUUID, hostUUID, streamUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteStreamClone(hostUUID, streamUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteStreamBulkClones(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		_, err := client.DeleteStreamClone(hostUUID, item.UUID)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
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
