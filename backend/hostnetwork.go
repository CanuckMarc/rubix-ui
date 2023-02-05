package backend

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

func (inst *App) GetNetworkSchema(connUUID string) string {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return "{}"
	}
	return client.GetNetworkSchema()
}

func (inst *App) AddHostNetwork(connUUID string, host *amodel.Network) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	if host.Name == "" {
		host.Name = fmt.Sprintf("net-%s", uuid.ShortUUID("")[5:10])
	}
	res, err := client.AddHostNetwork(host)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(res)
}

func (inst *App) GetHostNetworks(connUUID string) (resp []amodel.Network) {
	resp = []amodel.Network{}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	data, err := client.GetHostNetworks()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host networks %s", err))
	}
	return data
}

func (inst *App) GetHostNetwork(connUUID string, uuid string) *amodel.Network {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	data, err := client.GetHostNetwork(uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host network %s", err))
	}
	return data
}

func (inst *App) EditHostNetwork(connUUID string, hostUUID string, host *amodel.Network) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	res, err := client.UpdateHostNetwork(hostUUID, host)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(res)
}

func (inst *App) UpdateHostsStatus(connUUID, uuid string) *amodel.Network {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, _ := client.UpdateHostsStatus(uuid)
	return data
}

func (inst *App) DeleteHostNetworkBulk(connUUID string, uuids []UUIDs) bool {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return true
	}
	for _, item := range uuids {
		err := client.DeleteHostNetwork(item.UUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("delete network %s %s", item.Name, err))
			return false
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("deleted network: %s", item.Name))
		}
	}
	return true
}

func (inst *App) DeleteHostNetwork(connUUID string, uuid string) bool {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	err = client.DeleteHostNetwork(uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in deleting host network %s", err))
		return false
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("delete ok"))
		return true
	}
}
