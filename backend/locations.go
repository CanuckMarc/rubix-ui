package backend

import (
	"errors"
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
)

func (inst *App) GetLocationSchema(connUUID string) string {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return "{}"
	}
	return client.GetLocationSchema()
}

func (inst *App) AddLocation(connUUID string, body *amodel.Location) *amodel.Location {
	if body.Name == "" {
		body.Name = fmt.Sprintf("loc-%s", uuid.ShortUUID("")[5:10])
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.AddLocation(body)
	if data == nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in adding new host locations %s", res.Message))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("added new host location %s", data.Name))
	}
	return data
}

func (inst *App) GetLocations(connUUID string) (resp []amodel.Location) {
	resp = []amodel.Location{}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocations()
	if data == nil {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host locations %s", res.Message))
		return resp
	}
	return data
}

func (inst *App) DeleteLocationBulk(connUUID string, uuids []UUIDs) interface{} {
	for _, item := range uuids {
		msg, err := inst.deleteLocation(connUUID, item.UUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("delete location %s %s", item.Name, msg.Message))
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("deleted location: %s", item.Name))
		}
	}
	return "ok"
}

func (inst *App) deleteLocation(connUUID string, uuid string) (*assistcli.Response, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	res := client.DeleteLocation(uuid)
	if res.StatusCode > 299 {
		return nil, errors.New(fmt.Sprintf("issue in deleting host location %s", res.Message))
	}
	return res, nil
}

func (inst *App) DeleteLocation(connUUID string, uuid string) *assistcli.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	res := client.DeleteLocation(uuid)
	if res.StatusCode > 299 {
		inst.uiErrorMessage(fmt.Sprintf("issue in deleting host location %s", res.Message))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("delete ok"))
	}
	return res
}

func (inst *App) GetLocation(connUUID string, uuid string) *amodel.Location {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocation(uuid)
	if res.StatusCode > 299 {
		inst.uiErrorMessage(fmt.Sprintf("issue in getting host location %s", res.Message))
	} else {
	}
	return data
}

func (inst *App) UpdateLocation(connUUID string, uuid string, host *amodel.Location) *amodel.Location {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	if host == nil {
		return nil
	}
	data, res := client.UpdateLocation(uuid, host)
	if res.StatusCode > 299 {
		inst.uiErrorMessage(fmt.Sprintf("issue in editing host location %s", res.Message))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("edit ok"))
	}
	return data
}
