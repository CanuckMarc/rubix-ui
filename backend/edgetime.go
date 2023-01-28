package backend

import (
	"fmt"

	"github.com/NubeIO/lib-date/datelib"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *App) GetHostTime(connUUID, hostUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeSystemTime(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeGetHardwareTZ(connUUID, hostUUID string) string {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return ""
	}
	data, err := client.EdgeGetHardwareTZ(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return ""
	}
	return data
}

func (inst *App) EdgeGetTimeZoneList(connUUID, hostUUID string) []string {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeGetTimeZoneList(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeUpdateTimezone(connUUID, hostUUID string, timeZone string) *system.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeUpdateTimezone(hostUUID, timeZone)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage(fmt.Sprintf("%s, please now reboot or repower the device", data.Message))
	return data
}

func (inst *App) EdgeUpdateSystemTime(connUUID, hostUUID string, timeString string) *datelib.Time {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	disable, err := client.EdgeNTPDisable(hostUUID) // first disable the NTP service
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("disable ntp %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage(fmt.Sprintf("disable ntp %s", disable.Message))
	data, err := client.EdgeUpdateSystemTime(hostUUID, timeString)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage(fmt.Sprintf("zone: %s utc: %s local: %s", data.SystemTimeZone, data.TimeUTC, data.TimeLocal))
	return data
}

func (inst *App) EdgeNTPEnable(connUUID, hostUUID string) *system.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeNTPEnable(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage(fmt.Sprintf("enabled ntp %s", data.Message))
	return data
}

func (inst *App) EdgeNTPDisable(connUUID, hostUUID string) *system.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeNTPDisable(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage(fmt.Sprintf("disable ntp %s", data.Message))
	return data
}
