package backend

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

func (inst *App) addFlowNetwork(connUUID, hostUUID string, body *model.FlowNetwork) (*model.FlowNetwork, error) {
	if body.Name == "" {
		body.Name = fmt.Sprintf("flow-%s", uuid.ShortUUID("")[5:10])
	}

	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	networks, err := client.AddFlowNetwork(hostUUID, body)
	if err != nil {
		return nil, err
	}
	return networks, nil
}

func (inst *App) AddFlowNetwork(connUUID, hostUUID string, body *model.FlowNetwork) *rumodel.Response {
	networks, err := inst.addFlowNetwork(connUUID, hostUUID, body)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(networks)
}

func (inst *App) GetFlowNetworks(connUUID, hostUUID string, withStream bool) []model.FlowNetwork {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	networks, err := client.GetFlowNetworks(hostUUID, withStream)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.FlowNetwork{}
	}
	return networks
}

func (inst *App) GetFlowNetwork(connUUID, hostUUID, uuid string, withStreams bool) *model.FlowNetwork {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	resp, err := client.GetFlowNetwork(hostUUID, uuid, withStreams)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EditFlowNetwork(connUUID, hostUUID, networkUUID string, body *model.FlowNetwork) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	networks, err := client.EditFlowNetwork(hostUUID, networkUUID, body)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(networks)
}

func (inst *App) DeleteFlowNetwork(connUUID, hostUUID, networkUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	_, err = client.DeleteFlowNetwork(hostUUID, networkUUID)
	if err != nil {
		inst.uiErrorMessage(err)
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteFlowNetworkBulk(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		_, err := client.DeleteFlowNetwork(hostUUID, item.UUID)
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

func (inst *App) SyncFlowNetworks(connUUID, hostUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, err = client.SyncFlowNetworks(hostUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse("synced flow-networks")
}
