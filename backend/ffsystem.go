package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/user"
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

func (inst *App) FFToken(connUUID, hostUUID, remoteHostUUID, username, password string) *rumodel.Response {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return rumodel.FailResponse(err)
	}
	body := user.User{Username: username, Password: password}
	res, err := client.EdgeBiosLogin(hostUUID, &body)
	if err != nil {
		return rumodel.FailResponse("Login failed")
	}
	jwtToken := res.AccessToken
	deviceInfo, err := client.GetEdgeDeviceInfoPublic(remoteHostUUID)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	autoConfiguredFFTokenName := inst.getAutoConfiguredFFTokenName(deviceInfo.SiteName, deviceInfo.DeviceName)
	tokens, err := client.EdgeBiosTokens(hostUUID, jwtToken)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	for _, token := range *tokens {
		if token.Name == autoConfiguredFFTokenName {
			if token.Blocked {
				_, err := client.EdgeBiosTokenBlock(hostUUID, jwtToken, token.UUID, false)
				if err != nil {
					return rumodel.FailResponse(err)
				}
			}
			_token, err := client.EdgeBiosToken(hostUUID, jwtToken, token.UUID)
			if err != nil {
				return rumodel.FailResponse(err)
			}
			return rumodel.SuccessResponse(_token.Token)
		}
	}
	token, err := client.EdgeBiosTokenGenerate(hostUUID, jwtToken, autoConfiguredFFTokenName)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(token.Token)
}

func (inst *App) getAutoConfiguredFFTokenName(siteName, deviceName string) string {
	return fmt.Sprintf("FF-%s-%s", siteName, deviceName)
}
