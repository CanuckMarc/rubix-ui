package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/chirpstack"
	"github.com/NubeIO/rubix-ui/backend/constants"
)

func (inst *App) csLogin(connUUID, hostUUID string) (*assistcli.Client, string, error) {
	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, "", nil
	}
	token, err := assistClient.CSLogin(hostUUID, constants.CSUname, constants.CSPassword)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, "", nil
	}
	return assistClient, token, nil
}

func (inst *App) CSGetDevices(connUUID, hostUUID, applicationID string) *chirpstack.Devices {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	devices, err := assistClient.CSGetDevices(hostUUID, token, applicationID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) CSGetDeviceProfiles(connUUID, hostUUID string) *chirpstack.DeviceProfiles {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	devices, err := assistClient.CSGetDeviceProfiles(hostUUID, token)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}
