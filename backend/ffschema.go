package backend

import (
	"fmt"
)

type ThingType string

var (
	Network ThingType = "network"
	Device  ThingType = "device"
	Point   ThingType = "point"
)

func getPluginSchemaGetURL(pluginName string, thingType ThingType) string {
	return fmt.Sprintf("ff/api/plugins/api/%s/schema/json/%s", pluginName, thingType)
}

func (inst *App) GetFlowNetworkSchema(connUUID, hostUUID, pluginName string) string {
	url := getPluginSchemaGetURL(pluginName, Network)
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	data, err := client.ProxyGET(hostUUID, url)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	return string(data.Body())
}

func (inst *App) GetFlowDeviceSchema(connUUID, hostUUID, pluginName string) string {
	url := getPluginSchemaGetURL(pluginName, Device)
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	data, err := client.ProxyGET(hostUUID, url)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	return string(data.Body())
}

func (inst *App) GetFlowPointSchema(connUUID, hostUUID, pluginName string) string {
	url := getPluginSchemaGetURL(pluginName, Point)
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	data, err := client.ProxyGET(hostUUID, url)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "{}"
	}
	return string(data.Body())
}
