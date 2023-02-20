package backend

import (
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/externaltoken"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/user"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
)

func (inst *App) EdgeBiosLogin(connUUID, hostUUID, username, password string) *model.TokenResponse {
	resp, err := inst.edgeBiosLogin(connUUID, hostUUID, username, password)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosTokens(connUUID, hostUUID, jwtToken string) *[]externaltoken.ExternalToken {
	resp, err := inst.edgeBiosTokens(connUUID, hostUUID, jwtToken)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosToken(connUUID, hostUUID, jwtToken, uuid string) *externaltoken.ExternalToken {
	resp, err := inst.edgeBiosToken(connUUID, hostUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosTokenGenerate(connUUID, hostUUID, jwtToken, name string) *externaltoken.ExternalToken {
	resp, err := inst.edgeBiosTokenGenerate(connUUID, hostUUID, jwtToken, name)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosTokenBlock(connUUID, hostUUID, jwtToken, uuid string, state bool) *externaltoken.ExternalToken {
	resp, err := inst.edgeBiosTokenBlock(connUUID, hostUUID, jwtToken, uuid, state)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosTokenRegenerate(connUUID, hostUUID, jwtToken, uuid string) *externaltoken.ExternalToken {
	resp, err := inst.edgeBiosTokenRegenerate(connUUID, hostUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeBiosTokenDelete(connUUID, hostUUID, jwtToken, uuid string) bool {
	resp, err := inst.edgeBiosTokenDelete(connUUID, hostUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	return resp
}

func (inst *App) EdgeBiosUpdateUser(connUUID, hostUUID, jwtToken, username, password string) bool {
	resp, err := inst.edgeBiosUpdateUser(connUUID, hostUUID, jwtToken, username, password)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	return resp
}

func (inst *App) edgeBiosLogin(connUUID, hostUUID, username, password string) (*model.TokenResponse, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	body := user.User{Username: username, Password: password}
	resp, err := client.EdgeBiosLogin(hostUUID, &body)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *App) edgeBiosTokens(connUUID, hostUUID, jwtToken string) (*[]externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosTokens(hostUUID, jwtToken)
}

func (inst *App) edgeBiosToken(connUUID, hostUUID, jwtToken, uuid string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosToken(hostUUID, jwtToken, uuid)
}

func (inst *App) edgeBiosTokenGenerate(connUUID, hostUUID, jwtToken, name string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosTokenGenerate(hostUUID, jwtToken, name)
}

func (inst *App) edgeBiosTokenBlock(connUUID, hostUUID, jwtToken, uuid string, block bool) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosTokenBlock(hostUUID, jwtToken, uuid, block)
}

func (inst *App) edgeBiosTokenRegenerate(connUUID, hostUUID, jwtToken, uuid string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosTokenRegenerate(hostUUID, jwtToken, uuid)
}

func (inst *App) edgeBiosTokenDelete(connUUID, hostUUID, jwtToken, uuid string) (bool, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return false, err
	}
	return client.EdgeBiosTokenDelete(hostUUID, jwtToken, uuid)
}

func (inst *App) edgeBiosUpdateUser(connUUID, hostUUID, jwtToken, username, password string) (bool, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return false, err
	}
	return client.EdgeBiosUpdateUser(hostUUID, jwtToken, username, password)
}
