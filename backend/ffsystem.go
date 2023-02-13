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
	_, err = client.FFSystemPing(hostUUID)
	if err != nil {
		msg := fmt.Sprintf("Check the IP, rubix-edge & flow-framework installation")
		return rumodel.FailResponse(msg)
	}
	return rumodel.SuccessResponse("Valid Host")
}
