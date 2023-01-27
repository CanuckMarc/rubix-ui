package backend

import (
	"errors"
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"gopkg.in/yaml.v3"
)

func (inst *App) bacnetChecks(connUUID, hostUUID, pluginName string) error {
	if pluginName != bacnetMasterPlg {
		return errors.New(fmt.Sprintf("network: %s is not not bacnet-master", pluginName))
	}
	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return err
	}
	plugin, err := assistClient.EdgeGetPlugin(hostUUID, pluginName)
	if err != nil {
		return err
	}
	if plugin == nil {
		return errors.New("failed to find plugin")
	}
	if !plugin.Enabled {
		return errors.New("bacnet plugin is not enabled, please enable the plugin")
	}
	getNetwork := inst.GetNetworkByPluginName(connUUID, hostUUID, pluginName, false)
	if getNetwork == nil {
		return errors.New("no network is added, please add network")
	}
	return nil
}

func (inst *App) GetBacnetDevicePoints(connUUID, hostUUID, deviceUUID string, addPoints, makeWriteable bool) []model.Point {
	points, err := inst.getBacnetDevicePoints(connUUID, hostUUID, deviceUUID, addPoints, makeWriteable)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("bacnet points %s", err.Error()))
		return nil
	}
	return points
}

func (inst *App) getBacnetDevicePoints(connUUID, hostUUID, deviceUUID string, addPoints, makeWriteable bool) ([]model.Point, error) {
	err := inst.bacnetChecks(connUUID, hostUUID, "bacnetmaster")
	if err != nil {
		return nil, err
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	if deviceUUID == "" {
		return nil, errors.New("bacnet device uuid cant not be empty")
	}
	return client.BacnetDevicePoints(hostUUID, deviceUUID, addPoints, makeWriteable)
}

func (inst *App) bacnetMasterWhois(connUUID, hostUUID, networkUUID string, opts *assistcli.WhoIsOpts) ([]model.Device, error) {
	var err error
	inst.edgeSystemCtlAction(connUUID, hostUUID, "bacnet-server-driver", amodel.Stop)
	err = inst.bacnetChecks(connUUID, hostUUID, bacnetMasterPlg)
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	devices, err := client.BacnetMasterWhoIs(hostUUID, opts)
	if err != nil {
		return nil, err
	}
	var devicesUpdated []model.Device
	for _, device := range devices {
		device.NetworkUUID = networkUUID
		devicesUpdated = append(devicesUpdated, device)
	}
	_, err = inst.edgeSystemCtlAction(connUUID, hostUUID, "bacnet-server-driver", amodel.Start)
	err = inst.errMsg(err)
	return devicesUpdated, nil
}

func (inst *App) BacnetMasterWhois(connUUID, hostUUID, networkUUID string, opts *assistcli.WhoIsOpts) []model.Device {
	devices, err := inst.bacnetMasterWhois(connUUID, hostUUID, networkUUID, opts)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) bacnetWhois(connUUID, hostUUID string, networkUUID, pluginName string) ([]model.Device, error) {
	err := inst.bacnetChecks(connUUID, hostUUID, pluginName)
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	network, err := client.FFGetNetworkByPluginName(hostUUID, bacnetMasterPlg, false)
	if err != nil {
		return nil, errors.New("no network is added, please add network")
	}
	var netUUID string
	if networkUUID != "" {
		netUUID = networkUUID
	} else {
		netUUID = network.UUID
	}
	if netUUID == "" {
		return nil, errors.New("flow network uuid can not be empty")
	}
	devices, err := client.BacnetWhoIs(hostUUID, &assistcli.WhoIsOpts{GlobalBroadcast: true}, netUUID, false)
	if err != nil {
		return nil, err
	}
	return devices, nil
}

func (inst *App) BacnetWhois(connUUID, hostUUID, networkUUID, pluginName string) []model.Device {
	devices, err := inst.bacnetWhois(connUUID, hostUUID, networkUUID, pluginName)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return devices
}

func (inst *App) BACnetWriteConfig(connUUID, hostUUID string, config assistcli.ConfigBACnetServer) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return
	}
	writeConfig, err := client.BACnetWriteConfig(hostUUID, "bacnet-server-driver", config)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return
	}
	inst.uiSuccessMessage(fmt.Sprintf("updated config ok %v", writeConfig.Message))
	_, err = inst.edgeSystemCtlAction(connUUID, hostUUID, "bacnet-server-driver", amodel.Restart)
	if err != nil {
		inst.uiErrorMessage("failed to restart bacnet-server")
		return
	}
	inst.uiSuccessMessage("restarted bacnet-server")
}

func (inst *App) BACnetReadConfig(connUUID, hostUUID string) assistcli.ConfigBACnetServer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	data := assistcli.ConfigBACnetServer{}
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return data
	}
	config, connectionError, requestErr := client.EdgeReadConfig(hostUUID, "bacnet-server-driver", "config.yml")
	if connectionError != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return data
	}
	if requestErr != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return data
	}
	err = yaml.Unmarshal(config.Data, &data)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return data
	}
	return data

}
