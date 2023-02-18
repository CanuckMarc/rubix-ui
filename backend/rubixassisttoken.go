package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/externaltoken"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/user"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
)

func (inst *App) RubixAssistLogin(connUUID, username, password string) *model.TokenResponse {
	resp, err := inst.rubixAssistLogin(connUUID, username, password)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) RubixAssistTokens(connUUID, jwtToken string) *[]externaltoken.ExternalToken {
	resp, err := inst.rubixAssistTokens(connUUID, jwtToken)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) RubixAssistToken(connUUID, jwtToken, uuid string) *externaltoken.ExternalToken {
	resp, err := inst.rubixAssistToken(connUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) RubixAssistTokenGenerate(connUUID, jwtToken, name string) *externaltoken.ExternalToken {
	resp, err := inst.rubixAssistTokenGenerate(connUUID, jwtToken, name)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	inst.uiSuccessMessage("Step 1: copy the token & Step 2: edit the connection and paste in the generated token")
	return resp
}

func (inst *App) RubixAssistTokenBlock(connUUID, jwtToken, uuid string, state bool) *externaltoken.ExternalToken {
	resp, err := inst.rubixAssistTokenBlock(connUUID, jwtToken, uuid, state)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) RubixAssistTokenRegenerate(connUUID, jwtToken, uuid string) *externaltoken.ExternalToken {
	resp, err := inst.rubixAssistTokenRegenerate(connUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) RubixAssistTokenDelete(connUUID, jwtToken, uuid string) bool {
	resp, err := inst.rubixAssistTokenDelete(connUUID, jwtToken, uuid)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	return resp
}

func (inst *App) RubixAssistUpdateUser(connUUID, jwtToken, username, password string) bool {
	resp, err := inst.rubixAssistUpdateUser(connUUID, jwtToken, username, password)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	inst.uiSuccessMessage(fmt.Sprintf("Successfully updated user %s", username))
	return resp
}

func (inst *App) rubixAssistLogin(connUUID, username, password string) (*model.TokenResponse, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	body := user.User{Username: username, Password: password}
	resp, err := client.RubixAssistLogin(&body)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *App) rubixAssistTokens(connUUID, jwtToken string) (*[]externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.RubixAssistTokens(jwtToken)
}

func (inst *App) rubixAssistToken(connUUID, jwtToken, uuid string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.RubixAssistToken(jwtToken, uuid)
}

func (inst *App) rubixAssistTokenGenerate(connUUID, jwtToken, name string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.RubixAssistTokenGenerate(jwtToken, name)
}

func (inst *App) rubixAssistTokenBlock(connUUID, jwtToken, uuid string, block bool) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.RubixAssistTokenBlock(jwtToken, uuid, block)
}

func (inst *App) rubixAssistTokenRegenerate(connUUID, jwtToken, uuid string) (*externaltoken.ExternalToken, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.RubixAssistTokenRegenerate(jwtToken, uuid)
}

func (inst *App) rubixAssistTokenDelete(connUUID, jwtToken, uuid string) (bool, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return false, err
	}
	return client.RubixAssistTokenDelete(jwtToken, uuid)
}

func (inst *App) rubixAssistUpdateUser(connUUID, jwtToken, username, password string) (bool, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return false, err
	}
	return client.RubixAssistUpdateUser(jwtToken, username, password)
}
