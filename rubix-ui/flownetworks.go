package main

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/nils"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
)

func (inst *App) DeleteFlowNetworkBulk(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		_, err := client.DeleteFlowNetwork(hostUUID, item.UUID)
		if err != nil {
			errorCount++
			inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.crudMessage(true, fmt.Sprintf("delete count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.crudMessage(false, fmt.Sprintf("failed to delete count: %d", errorCount))
	}
	return nil
}

func (inst *App) GetFlowNetwork(connUUID, hostUUID, uuid string, withStreams bool) *model.FlowNetwork {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	resp, err := client.GetFlowNetwork(hostUUID, uuid, withStreams)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return resp
}

func (inst *App) GetFlowNetworks(connUUID, hostUUID string, withStream bool) []model.FlowNetwork {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	networks, err := client.GetFlowNetworks(hostUUID, withStream)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return []model.FlowNetwork{}
	}
	return networks
}

func (inst *App) addFlowNetwork(connUUID, hostUUID string, body *model.FlowNetwork) (*model.FlowNetwork, error) {
	if body.Name == "" {
		body.Name = fmt.Sprintf("flow-%s", uuid.ShortUUID("")[5:10])
	}

	if nils.StringNilCheck(body.FlowToken) {
		body.IsTokenAuth = nils.NewTrue()
	}

	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	pprint.PrintJOSN(body)
	networks, err := client.AddFlowNetwork(hostUUID, body)
	if err != nil {
		return nil, err
	}

	return networks, nil
}

func (inst *App) AddFlowNetwork(connUUID, hostUUID string, body *model.FlowNetwork) *model.FlowNetwork {
	networks, err := inst.addFlowNetwork(connUUID, hostUUID, body)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}

func (inst *App) EditFlowNetwork(connUUID, hostUUID, networkUUID string, body *model.FlowNetwork) *model.FlowNetwork {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	networks, err := client.EditFlowNetwork(hostUUID, networkUUID, body)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}
func (inst *App) DeleteFlowNetwork(connUUID, hostUUID, networkUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteFlowNetwork(hostUUID, networkUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) getFlowNetwork(connUUID, hostUUID, networkUUID string, withStream bool) (*model.FlowNetwork, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	networks, err := client.GetFlowNetwork(hostUUID, networkUUID, withStream)
	if err != nil {
		return nil, err
	}
	return networks, nil
}
