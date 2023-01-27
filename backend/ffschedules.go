package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/bools"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
)

func (inst *App) GetSchedules(connUUID, hostUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	sch, err := client.FFGetSchedules(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return sch
}
func (inst *App) GetSchedule(connUUID, hostUUID, uuid string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	sch, err := client.FFGetSchedule(hostUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return sch
}

func (inst *App) AddSchedule(connUUID, hostUUID, name, timeZone string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	body := &assistcli.Schedule{
		Name:       name,
		Enable:     bools.NewTrue(),
		ThingClass: "schedule",
		ThingType:  "schedule",
		TimeZone:   timeZone,
	}
	// pprint.PrintJOSN(body)
	sch, err := client.FFAddSchedule(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return sch
}

func (inst *App) EditSchedule(connUUID, hostUUID, uuid string, body *assistcli.Schedule) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	// pprint.PrintJOSN(body)
	sch, err := client.FFEditSchedule(hostUUID, uuid, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return sch
}

func (inst *App) DeleteSchedule(connUUID, hostUUID, uuid string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	sch, err := client.FFDeleteSchedule(hostUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return sch
}
