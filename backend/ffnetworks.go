package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/storage/logstore"
)

type UUIDs struct {
	Name string `json:"name"`
	UUID string `json:"uuid"`
}

func (inst *App) DeleteNetworkBulk(connUUID, hostUUID string, networkUUIDs []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, net := range networkUUIDs {
		_, err := client.FFDeleteNetwork(hostUUID, net.UUID)
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

func (inst *App) getNetworksWithPoints(connUUID, hostUUID string) ([]model.Network, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.Network{}, err
	}
	networks, err := client.FFGetNetworksWithPoints(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []model.Network{}, err
	}
	return networks, nil
}

func (inst *App) getNetworks(connUUID, hostUUID string, withDevice bool, overrideUrl ...string) ([]model.Network, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return []model.Network{}, err
	}
	networks, err := client.FFGetNetworks(hostUUID, withDevice, overrideUrl...)
	if err != nil {
		return []model.Network{}, err
	}
	return networks, nil
}

func (inst *App) GetNetworks(connUUID, hostUUID string, withDevice bool) []model.Network {
	networks, err := inst.getNetworks(connUUID, hostUUID, withDevice)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}

func (inst *App) addNetwork(connUUID, hostUUID string, body *model.Network) (*model.Network, error) {
	if body.Name == "" {
		body.Name = fmt.Sprintf("%s", body.PluginPath)
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	networks, err := client.FFAddNetwork(hostUUID, body, true)
	return networks, err
}

func (inst *App) AddNetwork(connUUID, hostUUID string, body *model.Network) *model.Network {
	networks, err := inst.addNetwork(connUUID, hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}

func (inst *App) ImportNetworksBulk(connUUID, hostUUID, backupUUID string) *BulkAddResponse {
	resp, err := inst.importNetworksBulk(connUUID, hostUUID, backupUUID, true)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) ExportNetworksBulk(connUUID, hostUUID, userComment string, deviceUUIDs []string) *storage.Backup {
	resp, err := inst.exportNetworksBulk(connUUID, hostUUID, userComment, deviceUUIDs)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) exportNetworksBulk(connUUID, hostUUID, userComment string, networkUUIDs []string) (*storage.Backup, error) {
	var networkList []model.Network
	var count int
	network, err := inst.getNetworksWithPoints(connUUID, hostUUID)
	if err != nil {
		return nil, err
	}
	for _, uuid := range networkUUIDs {
		for _, net := range network {
			if net.UUID == uuid {
				networkList = append(networkList, net)
			}
			count++
		}
	}
	back := &storage.Backup{}
	back.ConnectionUUID = connUUID
	back.HostUUID = hostUUID
	back.Application = fmt.Sprintf("%s", logstore.FlowFramework)
	back.SubApplication = fmt.Sprintf("%s", logstore.FlowFrameworkNetwork)
	back.UserComment = userComment
	back.Data = networkList
	backup, err := inst.addBackup(back)
	if err != nil {
		return nil, err
	}
	return backup, nil
}

func (inst *App) importNewNetwork(connUUID, hostUUID string, body *model.Network) {
	devices := body.Devices
	if devices != nil {
		for _, device := range devices {
			device.NetworkUUID = body.UUID
			inst.AddDevice(connUUID, hostUUID, device)
			points := device.Points
			for _, point := range points {
				point.DeviceUUID = device.UUID
				inst.AddPoint(connUUID, hostUUID, point)
			}
		}
	}
}

func (inst *App) EditNetwork(connUUID, hostUUID, networkUUID string, body *model.Network) *model.Network {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	networks, err := client.FFEditNetwork(hostUUID, networkUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}
func (inst *App) DeleteNetwork(connUUID, hostUUID, networkUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	_, err = client.FFDeleteNetwork(hostUUID, networkUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) getNetwork(connUUID, hostUUID, networkUUID string, withDevice bool, overrideUrl ...string) (*model.Network, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	networks, err := client.FFGetNetwork(hostUUID, networkUUID, withDevice, overrideUrl...)
	if err != nil {
		return nil, err
	}
	return networks, nil
}

func (inst *App) getNetworkWithPoints(connUUID, hostUUID, networkUUID string) (*model.Network, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	networks, err := client.FFGetNetworkWithPoints(hostUUID, networkUUID)
	if err != nil {
		return nil, err
	}
	return networks, nil
}

func (inst *App) getNetworkByPluginName(connUUID, hostUUID, pluginName string, withDevice bool) (*model.Network, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	network, err := client.FFGetNetworkByPluginName(hostUUID, pluginName)
	if err != nil {
		return nil, err
	}
	return network, nil
}

func (inst *App) GetNetworkByPluginName(connUUID, hostUUID, pluginName string, withDevice bool) *model.Network {
	net, err := inst.getNetworkByPluginName(connUUID, hostUUID, pluginName, withDevice)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return net
}

type NetworksList struct {
	Name      string `json:"name"`
	PointUUID string `json:"point_uuid"`
}

func (inst *App) GetNetworksWithPointsDisplay(connUUID, hostUUID string) []NetworksList {
	list, err := inst.getNetworksWithPointsDisplay(connUUID, hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return list
}

func (inst *App) getNetworksWithPointsDisplay(connUUID, hostUUID string) ([]NetworksList, error) {
	networks, err := inst.getNetworksWithPoints(connUUID, hostUUID)
	if err != nil {
		return nil, err
	}
	var networksLists []NetworksList
	var networksList NetworksList
	for _, network := range networks {
		for _, device := range network.Devices {
			for _, point := range device.Points {
				networksList.Name = fmt.Sprintf("%s:%s:%s", network.Name, device.Name, point.Name)
				networksList.PointUUID = point.UUID
				networksLists = append(networksLists, networksList)
			}
		}
	}
	return networksLists, nil
}

func (inst *App) GetNetworksWithPoints(connUUID, hostUUID string) []model.Network {
	networks, err := inst.getNetworksWithPoints(connUUID, hostUUID)

	if err != nil {
		return nil
	}
	return networks
}

func (inst *App) GetNetworkWithPoints(connUUID, hostUUID, networkUUID string) *model.Network {
	networks, err := inst.getNetworkWithPoints(connUUID, hostUUID, networkUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}

func (inst *App) GetNetwork(connUUID, hostUUID, networkUUID string, withDevice bool) *model.Network {
	networks, err := inst.getNetwork(connUUID, hostUUID, networkUUID, withDevice)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return networks
}

// GetNetworkBackupsByUUID get all backups for a network
func (inst *App) GetNetworkBackupsByUUID(application, subApplication, networkUUID string) []storage.Backup {
	data := inst.GetBackupsByApplication(application, subApplication, true)
	var backups []storage.Backup
	for _, back := range data {
		network, ok := back.Data.(*model.Network)
		if ok {
			if network.UUID == networkUUID {
				backups = append(backups, back)
			}
		}
	}
	return backups
}

// GetNetworkBackupsByPlugin get all backups for a network by its plugin
func (inst *App) GetNetworkBackupsByPlugin(application, subApplication, pluginName string) []storage.Backup {
	data := inst.GetBackupsByApplication(application, subApplication, true)
	var backups []storage.Backup
	for _, back := range data {
		network, ok := back.Data.(*model.Network)
		if ok {
			if network.PluginPath == pluginName {
				backups = append(backups, back)
			}
		}
	}
	return backups
}

func (inst *App) SyncNetworks(connUUID, hostUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, err = client.SyncNetworks(hostUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse("synced networks")
}
