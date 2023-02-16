package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/chirpstack"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"github.com/NubeIO/rubix-ui/backend/ttime"
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

func (inst *App) CSGetGateway(connUUID, hostUUID string) *chirpstack.GatewaysResult {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	resp, err := assistClient.CSGetGateways(hostUUID, token)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	if len(resp.Result) > 0 {
		r := resp.Result[0]
		r.LastSeenAtString = ttime.TimeSince(r.LastSeenAt)
		r.LastSeenAtString = ttime.TimeSince(r.LastSeenAt)
		r.CreatedAt = r.CreatedAt.Local()
		r.UpdatedAt = r.UpdatedAt.Local()
		r.FirstSeenAt = r.FirstSeenAt.Local()
		r.LastSeenAt = r.LastSeenAt.Local()
		return r
	}
	return nil
}

func (inst *App) CSGetGateways(connUUID, hostUUID string) *chirpstack.Gateways {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	resp, err := assistClient.CSGetGateways(hostUUID, token)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	for _, result := range resp.Result {
		inst.uiSuccessMessage(fmt.Sprintf("lorawan: found gateway: %s", result.LastSeenAtString))
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

	format := "2006-01-02 15:04:05"
	for _, result := range devices.Result {
		result.LastSeenAtReadable = ttime.TimeSince(result.LastSeenAt)
		result.LastSeenAtTime = result.LastSeenAt.Local().Format(format)
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
	device, err := assistClient.CSAddDevice(hostUUID, token, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	if device != nil {
		inst.uiSuccessMessage(fmt.Sprintf("added LoRaWAN device EUI: %s please now activate the device", body.Device.DevEUI))
	}

	return device
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
	inst.uiSuccessMessage(fmt.Sprintf("updated LoRaWAN device EUI: %s ok!", devEui))
	return devices
}

func (inst *App) CSDeviceOTAKeys(connUUID, hostUUID, devEui, key string) interface{} {
	assistClient, token, err := inst.csLogin(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	body := &chirpstack.DeviceKey{
		DeviceKeys: struct {
			DevEUI    string `json:"devEUI"`
			NwkKey    string `json:"nwkKey"`
			AppKey    string `json:"appKey"`
			GenAppKey string `json:"genAppKey"`
		}{
			DevEUI: devEui,
			NwkKey: key,
		},
	}
	devices, err := assistClient.CSDeviceOTAKeys(hostUUID, token, devEui, body)
	if err != nil {
		devices, errUpdate := assistClient.CSDeviceOTAKeysUpdate(hostUUID, token, devEui, body)
		if errUpdate != nil {
			inst.uiErrorMessage(fmt.Sprintf("failed to activate on update device %s", errUpdate.Error()))
			return nil
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("updated activated LoRaWAN device EUI: %s network-key: %s", devEui, key))
			return devices
		}
	}
	inst.uiSuccessMessage(fmt.Sprintf("activated LoRaWAN device EUI: %s network-key: %s", devEui, key))
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
	inst.uiSuccessMessage(fmt.Sprintf("deleted LoRaWAN device EUI: %s ok", devEui))
	return deleted
}
