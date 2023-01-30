package backend

import (
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	log "github.com/sirupsen/logrus"
)

func (inst *App) GetHostSchema(connUUID string) string {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return "{}"
	}
	return client.GetHostSchema()
}

func (inst *App) AddHost(connUUID string, host *amodel.Host) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	resp, err := client.AddHost(host)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(resp)
}

func (inst *App) DeleteHostBulk(connUUID string, uuids []UUIDs) interface{} {
	for _, item := range uuids {
		msg, err := inst.deleteHost(connUUID, item.UUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("delete host %s %s", item.Name, msg.Message))
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("deleted host: %s", item.Name))
		}
	}
	return "deleted successfully"
}

func (inst *App) deleteHost(connUUID string, uuid string) (*assistcli.Response, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	res := client.DeleteHost(uuid)
	if res.StatusCode > 299 {
		return nil, errors.New(fmt.Sprintf("issue in deleting host network %s", res.Message))
	}
	return res, nil
}

func (inst *App) DeleteHost(connUUID string, uuid string) *assistcli.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	res := client.DeleteHost(uuid)
	return res
}

func (inst *App) getHost(connUUID string, uuid string) (*amodel.Host, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	host, resp := client.GetHost(uuid)
	if resp.StatusCode > 299 {
		errMsg := fmt.Sprintf("error on get host %s", uuid)
		log.Errorln(errMsg)
		return nil, errors.New(errMsg)
	}
	return host, nil
}

func (inst *App) GetHost(connUUID string, uuid string) *amodel.Host {
	host, err := inst.getHost(connUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return host
}

func (inst *App) EditHost(connUUID string, uuid string, host *amodel.Host) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	resp, err := client.UpdateHost(uuid, host)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(resp)
}

func (inst *App) GetHosts(connUUID string) (resp []amodel.Host) {
	resp = []amodel.Host{}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, _ := client.GetHosts()
	return data
}

func (inst *App) UpdateStatus(connUUID string) (resp []amodel.Host) {
	resp = []amodel.Host{}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, _ := client.UpdateStatus()
	return data
}
