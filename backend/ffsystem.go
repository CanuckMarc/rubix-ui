package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

func (inst *App) FFSystemPing(connUUID, hostUUID string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	host, err := inst.getHost(connUUID, hostUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, err = client.FFSystemPing(hostUUID)
	if err != nil {
		msg := fmt.Sprintf("Check the IP: %s & rubix-edge, flow-framework installation on that device", host.IP)
		return rumodel.FailResponse(msg)
	}
	return rumodel.SuccessResponse("Valid Host")
}
