package backend

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/storage/logstore"
)

func (inst *App) GetDevices(connUUID, hostUUID string, withPoints bool) []model.Device {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	devices, err := client.GetDevices(hostUUID, withPoints)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) AddDevicesBulk(connUUID, hostUUID string, body []model.Device) {
	var addedCount int
	var errorCount int
	for _, dev := range body {
		_, err := inst.addDevice(connUUID, hostUUID, &dev)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("added count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to add count: %d", errorCount))
	}

}

func (inst *App) addDevice(connUUID, hostUUID string, body *model.Device) (*model.Device, error) {
	if body.Name == "" {
		body.Name = fmt.Sprintf("device-%s", uuid.ShortUUID("")[5:10])
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	devices, err := client.AddDevice(hostUUID, body)
	if err != nil {
		return nil, err
	}
	return devices, nil
}

func (inst *App) AddDevice(connUUID, hostUUID string, body *model.Device) *model.Device {
	devices, err := inst.addDevice(connUUID, hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) GetNetworkDevices(connUUID, hostUUID, networkUUID string) []*model.Device {
	net, err := inst.getNetwork(connUUID, hostUUID, networkUUID, true)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	devices := net.Devices
	return devices
}

func (inst *App) EditDevice(connUUID, hostUUID, deviceUUID string, body *model.Device) *model.Device {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	devices, err := client.EditDevice(hostUUID, deviceUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) DeleteDeviceBulk(connUUID, hostUUID string, deviceUUIDs []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, dev := range deviceUUIDs {
		_, err := client.DeleteDevice(hostUUID, dev.UUID)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("delete count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to delete count: %d", errorCount))
	}
	return nil
}

func (inst *App) DeleteDevice(connUUID, hostUUID, deviceUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteDevice(hostUUID, deviceUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) getDevice(connUUID, hostUUID, deviceUUID string, withPoints bool) (*model.Device, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	devices, err := client.GetDevice(hostUUID, deviceUUID, withPoints)
	if err != nil {
		return nil, err
	}
	return devices, nil
}

func (inst *App) GetDevice(connUUID, hostUUID, deviceUUID string, withPoints bool) *model.Device {
	devices, err := inst.getDevice(connUUID, hostUUID, deviceUUID, withPoints)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) ImportDevicesBulk(connUUID, hostUUID, backupUUID, networkUUID string) *BulkAddResponse {
	resp, err := inst.importDevicesBulk(connUUID, hostUUID, backupUUID, networkUUID, true)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) ExportDevicesBulk(connUUID, hostUUID, userComment, networkUUID string, deviceUUIDs []string) *storage.Backup {
	resp, err := inst.exportDevicesBulk(connUUID, hostUUID, userComment, networkUUID, deviceUUIDs)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) exportDevicesBulk(connUUID, hostUUID, userComment, networkUUID string, deviceUUIDs []string) (*storage.Backup, error) {
	var pointsList []model.Device
	var count int
	network, err := inst.getNetworkWithPoints(connUUID, hostUUID, networkUUID)
	if err != nil {
		return nil, err
	}
	for _, uuid := range deviceUUIDs {
		for _, device := range network.Devices {
			if device.UUID == uuid {
				pointsList = append(pointsList, *device)
			}
			count++
		}
	}
	back := &storage.Backup{}
	back.ConnectionUUID = connUUID
	back.HostUUID = hostUUID
	back.Application = fmt.Sprintf("%s", logstore.FlowFramework)
	back.SubApplication = fmt.Sprintf("%s", logstore.FlowFrameworkDevice)
	back.UserComment = userComment
	back.Data = pointsList
	backup, err := inst.addBackup(back)
	if err != nil {
		return nil, err
	}
	return backup, nil
}

func (inst *App) SyncDevices(connUUID, hostUUID, networkUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, err = client.SyncDevices(hostUUID, networkUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse("synced devices")
}
