package backend

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
)

func (inst *App) AddStream(connUUID, hostUUID string, flowNetworkUUID string, body *model.Stream) *model.Stream {
	if body.Name == "" {
		body.Name = fmt.Sprintf("stream-%s", uuid.ShortUUID("")[5:10])
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return &model.Stream{}
	}
	if flowNetworkUUID == "" {
		inst.uiErrorMessage(fmt.Sprintf("flow-network uuid can not be empty"))
		return nil
	}

	streams, err := client.AddStreamToExistingFlow(hostUUID, flowNetworkUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return &model.Stream{}
	}
	return streams
}

func (inst *App) GetStreams(connUUID, hostUUID string) []model.Stream {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	streams, err := client.GetStreams(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.Stream{}
	}
	return streams
}

func (inst *App) getStream(connUUID, hostUUID, streamUUID string, withProducers, withWriterClones bool) (*model.Stream, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	stream, err := client.GetStream(hostUUID, streamUUID, withProducers, withWriterClones)
	if err != nil {
		return nil, err
	}
	return stream, nil
}

func (inst *App) GetStream(connUUID, hostUUID, streamUUID string, withProducers, withWriterClones bool) *model.Stream {
	stream, err := inst.getStream(connUUID, hostUUID, streamUUID, withProducers, withWriterClones)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return stream
}

func (inst *App) EditStream(connUUID, hostUUID, streamUUID string, body *model.Stream) *model.Stream {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return &model.Stream{}
	}
	streams, err := client.EditStream(hostUUID, streamUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return streams
}

func (inst *App) DeleteStream(connUUID, hostUUID, streamUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteStream(hostUUID, streamUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteStreamBulk(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		_, err := client.DeleteStream(hostUUID, item.UUID)
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
