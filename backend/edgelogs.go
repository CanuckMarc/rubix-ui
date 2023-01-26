package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-edge/pkg/streamlog"
)

func (inst *App) edgeAddLog(connUUID, hostUUID, serviceName string, duration int) (*streamlog.Log, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, nil
	}
	body := &streamlog.Log{
		Service:  serviceName,
		Duration: duration,
	}
	return client.EdgeAddLog(hostUUID, body)
}

func (inst *App) edgeGetLogs(connUUID, hostUUID string) ([]streamlog.Log, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, nil
	}
	return client.EdgeGetLogs(hostUUID)
}
