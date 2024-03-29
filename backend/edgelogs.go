package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-edge/pkg/streamlog"
	"github.com/NubeIO/rubix-ui/backend/constants"
)

func pluginLogs(pluginName string) []string {
	var stringFilters []string
	switch pluginName {
	case bacnetServerPlg:
		stringFilters = []string{"bacnet"}
	case bacnetMasterPlg:
		stringFilters = []string{"bacnet"}
	case loraPlg:
		stringFilters = []string{"lora"}
	case modbusPlg:
		stringFilters = []string{"modbus"}
	case edge28Plg:
		stringFilters = []string{"edge28"}
	case rubixIOPlg:
		stringFilters = []string{"rubixio"}
	case systemPlg:
		stringFilters = []string{"system"}
	case loraWANPlg:
		stringFilters = []string{"lorawan"}
	}
	return stringFilters
}

func (inst *App) edgeCreateLog(connUUID, hostUUID, serviceName string, duration int, filters []string) (*streamlog.Log, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, nil
	}
	if duration == 0 {
		duration = 10
	}
	if duration > 60 {
		duration = 60
	}
	body := &streamlog.Log{
		Service:        serviceName,
		Duration:       duration,
		KeyWordsFilter: filters,
	}
	return client.EdgeCreateLog(hostUUID, body)
}

func (inst *App) edgeGetLogs(connUUID, hostUUID string) ([]streamlog.Log, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, nil
	}
	return client.EdgeGetLogs(hostUUID)
}

// FlowNetworkNewLog let user get network driver logs from flow framework
func (inst *App) FlowNetworkNewLog(connUUID, hostUUID, pluginName string, duration int) *streamlog.Log {
	if pluginName == "" {
		inst.uiErrorMessage("get plugin logs: no module/plugin found be name was provided")
		return nil
	}
	filters := pluginLogs(pluginName)
	if len(filters) == 0 {
		inst.uiErrorMessage(fmt.Sprintf("get plugin logs: no module/plugin found be name: %s", pluginName))
		return nil
	}
	logs, err := inst.edgeCreateLog(connUUID, hostUUID, "nubeio-flow-framework.service", duration, filters)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("get plugin logs error: %s", err.Error()))
		return nil
	}
	return logs

}

func appLogs(pluginName string) string {
	var serviceName string
	switch pluginName {
	case constants.BacnetServerDriver:
		serviceName = constants.BacnetServerServiceName
	case constants.FlowFramework:
		serviceName = constants.FlowFrameworkServiceName
	case constants.RubixEdgeWires:
		serviceName = constants.RubixEdgeWiresServiceName
	case constants.LoRaSerialApp:
		serviceName = constants.LoRaSerialAppServiceName
	case constants.LoRaModbusBrideApp:
		serviceName = constants.LoRaModbusBrideAppServiceName
	case constants.RubixIOApp:
		serviceName = constants.RubixIOAppServiceName
	}
	return serviceName
}

// EdgeAppNewLog let user get network driver logs from flow framework
func (inst *App) EdgeAppNewLog(connUUID, hostUUID, appName string, duration int) *streamlog.Log {
	if appName == "" {
		inst.uiErrorMessage("get app logs: no app found be name was provided")
		return nil
	}
	serviceName := appLogs(appName)
	if serviceName == "" {
		inst.uiErrorMessage(fmt.Sprintf("get app logs: no app found be name: %s", appName))
		return nil
	}
	logs, err := inst.edgeCreateLog(connUUID, hostUUID, fmt.Sprintf("%s.service", serviceName), duration, nil)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("get app logs error: %s", err.Error()))
		return nil
	}
	return logs

}
