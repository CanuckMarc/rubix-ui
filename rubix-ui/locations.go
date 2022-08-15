package main

import (
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/pkg/assistmodel"
	"github.com/NubeIO/rubix-assist/service/clients/assitcli"
	"github.com/NubeIO/rubix-ui/backend/helpers/humanize"
)

func (inst *App) GetLocationSchema(connUUID string) interface{} {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocationSchema()
	if data == nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", res.Message))
	}
	out := map[string]interface{}{
		"properties": data,
	}
	return out
}

func (inst *App) GetLocationTableSchema(connUUID string) interface{} {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocationSchema()
	if data == nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", res.Message))
	}
	return humanize.BuildTableSchema(data)
}

func (inst *App) AddLocation(connUUID string, body *assistmodel.Location) *assistmodel.Location {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.AddLocation(body)
	if data == nil {
		inst.crudMessage(false, fmt.Sprintf("issue in adding new host locations %s", res.Message))
	} else {
		inst.crudMessage(true, fmt.Sprintf("added new host location %s", data.Name))
	}
	return data
}

func (inst *App) GetLocations(connUUID string) (resp []assistmodel.Location) {
	resp = []assistmodel.Location{}
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocations()
	if data == nil {
		inst.crudMessage(false, fmt.Sprintf("issue in getting host locations %s", res.Message))
		return resp
	}
	return data
}

func (inst *App) DeleteLocationBulk(connUUID string, uuids []UUIDs) interface{} {
	for _, item := range uuids {
		msg, err := inst.deleteLocation(connUUID, item.UUID)
		if err != nil {
			inst.crudMessage(false, fmt.Sprintf("delete location %s %s", item.Name, msg.Message))
		} else {
			inst.crudMessage(true, fmt.Sprintf("deleteed location: %s", item.Name))
		}
	}
	return "ok"
}

func (inst *App) deleteLocation(connUUID string, uuid string) (*assitcli.Response, error) {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		return nil, err
	}
	res := client.DeleteLocation(uuid)
	if res.StatusCode > 299 {
		return nil, errors.New(fmt.Sprintf("issue in deleting host location %s", res.Message))
	}
	return res, nil
}

func (inst *App) DeleteLocation(connUUID string, uuid string) *assitcli.Response {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	res := client.DeleteLocation(uuid)
	if res.StatusCode > 299 {
		inst.crudMessage(false, fmt.Sprintf("issue in deleting host location %s", res.Message))
	} else {
		inst.crudMessage(true, fmt.Sprintf("delete ok"))
	}
	return res
}

func (inst *App) GetLocation(connUUID string, uuid string) *assistmodel.Location {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, res := client.GetLocation(uuid)
	if res.StatusCode > 299 {
		inst.crudMessage(false, fmt.Sprintf("issue in getting host location %s", res.Message))
	} else {
	}
	return data
}

func (inst *App) UpdateLocation(connUUID string, uuid string, host *assistmodel.Location) *assistmodel.Location {
	client, err := inst.initConnection(connUUID)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	if host == nil {
		return nil
	}
	data, res := client.UpdateLocation(uuid, host)
	if res.StatusCode > 299 {
		inst.crudMessage(false, fmt.Sprintf("issue in editing host location %s", res.Message))
	} else {
		inst.crudMessage(true, fmt.Sprintf("edit ok"))
	}
	return data
}
