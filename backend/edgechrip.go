package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/chirpstack"
	"github.com/NubeIO/rubix-ui/backend/constants"
	log "github.com/sirupsen/logrus"
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

func (inst *App) CSGetApplications(connUUID, hostUUID string) *chirpstack.Applications {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	resp, err := assistClient.CSGetApplications(hostUUID, token)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
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

func (inst *App) CSGetDevices(connUUID, hostUUID, applicationID string) *chirpstack.Devices {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	if applicationID == "" {
		apps, err := assistClient.CSGetApplications(hostUUID, token)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return nil
		}
		if apps == nil {
			inst.uiErrorMessage("no application has been added, please add one before trying to add a device")
			return nil
		}
		for _, result := range apps.Result {
			applicationID = result.Id
		}
		if applicationID == "" {
			inst.uiErrorMessage("no application has been added, please add one before trying to add a device")
			return nil
		} else {
			log.Infof("lorawan-api: use application id: %s", applicationID)
		}
	}
	devices, err := assistClient.CSGetDevices(hostUUID, token, applicationID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) CSGetDevice(connUUID, hostUUID, devEui string) *chirpstack.Device {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	devices, err := assistClient.CSGetDevice(hostUUID, token, devEui)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) CSAddDevice(connUUID, hostUUID string, body *chirpstack.Device) *chirpstack.Device {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	if body == nil {
		inst.uiErrorMessage("add lora device body was empty")
		return nil
	}
	applicationID := body.Device.ApplicationID
	if applicationID == "" {
		apps, err := assistClient.CSGetApplications(hostUUID, token)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return nil
		}
		if apps == nil {
			inst.uiErrorMessage("no application has been added, please add one before trying to add a device")
			return nil
		}
		for _, result := range apps.Result {
			applicationID = result.Id
		}
		if applicationID == "" {
			inst.uiErrorMessage("no application has been added, please add one before trying to add a device")
			return nil
		} else {
			log.Infof("lorawan-api: use application id: %s", applicationID)
		}
		body.Device.ApplicationID = applicationID
	}
	devices, err := assistClient.CSAddDevice(hostUUID, token, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) CSEditDevice(connUUID, hostUUID, devEui string, body *chirpstack.Device) *chirpstack.Device {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	devices, err := assistClient.CSEditDevice(hostUUID, token, devEui, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) CSDeleteDevice(connUUID, hostUUID, devEui string) bool {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return false
	}
	deleted, err := assistClient.CSDeleteDevice(hostUUID, token, devEui)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return deleted
	}
	return deleted
}
