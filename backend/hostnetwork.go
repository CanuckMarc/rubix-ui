package backend

import (
	"errors"
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
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
	data, res := client.GetHostNetworks()
	if data == nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host networks %s", res.Message))
	}
	return data
}

func (inst *App) GetHostNetwork(connUUID string, uuid string) *amodel.Network {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	data, res := client.GetHostNetwork(uuid)
	if res.StatusCode > 299 {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host network %s", res.Message))
	} else {
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

func (inst *App) DeleteHostNetworkBulk(connUUID string, uuids []UUIDs) interface{} {
	for _, item := range uuids {
		msg, err := inst.deleteHostNetwork(connUUID, item.UUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("delete network %s %s", item.Name, msg.Message))
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("deleted network: %s", item.Name))
		}
	}
	return "deleted successfully"
}

func (inst *App) deleteHostNetwork(connUUID string, uuid string) (*assistcli.Response, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	res := client.DeleteHostNetwork(uuid)
	if res.StatusCode > 299 {
		return nil, errors.New(fmt.Sprintf("issue in deleting host network %s", res.Message))
	}
	return res, nil
}

func (inst *App) DeleteHostNetwork(connUUID string, uuid string) *assistcli.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	res := client.DeleteHostNetwork(uuid)
	if res.StatusCode > 299 {
		inst.uiErrorMessage(fmt.Sprintf("issue in deleting host network %s", res.Message))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("delete ok"))
	}
	return res
}
