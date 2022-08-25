package main

import (
	"errors"
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/user"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/nils"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/assistapi"
)

func (inst *App) assistGenerateToken(connUUID string, resetToken bool) error {
	connection, err := inst.getConnection(connUUID)
	if err != nil {
		return errors.New(fmt.Sprintf("get connection err:%s", err.Error()))
	}
	if connection == nil {
		return errors.New(fmt.Sprintf("connection not found :%s", connUUID))
	}
	client, err := inst.initConnectionAuth(&AssistClient{
		ConnUUID: connection.UUID,
	})
	if err != nil {
		return errors.New(fmt.Sprintf("assist-client init err:%s", err.Error()))
	}
	body := &user.User{Username: connection.Username, Password: connection.Password}
	resp, err := client.Login(body)
	if err != nil {
		return errors.New(fmt.Sprintf("assist-login err:%s", err.Error()))
	}
	jwtToken := resp.AccessToken
	tokens, err := client.GetTokens(jwtToken)
	if err != nil {
		return errors.New(fmt.Sprintf("assist-get-tokens err:%s", err.Error()))
	}
	tokenName := fmt.Sprintf("%s-%s", connection.UUID, connection.Name)
	for _, token := range tokens {
		if tokenName == token.Name {
			if resetToken {
				_, err := client.DeleteToken(jwtToken, token.UUID)
				if err != nil {
					return errors.New(fmt.Sprintf("assist-delete-token name:%s err:%s", token.Name, err.Error()))
				}
			} else {
				return errors.New(fmt.Sprintf("a token for host:%s alreay exists", connection.Name))
			}
		}
	}
	token, err := client.GenerateToken(resp.AccessToken, &assistapi.TokenCreate{
		Name:    tokenName,
		Blocked: nils.NewFalse(),
	})
	if err != nil {
		return errors.New(fmt.Sprintf("assist-generate token name:%s err:%s", tokenName, err.Error()))
	}
	connection.AssistToken = token.Token
	_, err = inst.updateConnection(connection.UUID, connection)
	if err != nil {
		return errors.New(fmt.Sprintf("update connection token in local db err:%s", err.Error()))
	}
	return nil
}

func (inst *App) testProxy(connUUID, hostUUID string) error {
	client, err := inst.initConnectionAuth(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return err
	}
	resp, err := client.EdgeSystemTime(hostUUID)
	fmt.Println(err)
	fmt.Println(resp)
	return err
}

func (inst *App) edgeAddNetwork(connUUID, hostUUID string, body *model.Network, restartPlugin bool) (*model.Network, error) {
	client, err := inst.initConnectionAuth(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil, err
	}
	resp, err := client.EdgeAddNetwork(hostUUID, body, restartPlugin)
	return resp, err
}

func (inst *App) GetFlowNetwork(connUUID, hostUUID, uuid string, withStreams bool) *model.FlowNetwork {
	client, err := inst.initConnectionAuth(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	url := fmt.Sprintf("/api/flow_networks/%s?streams=false", uuid)
	if withStreams {
		url = fmt.Sprintf("/api/flow_networks/%s?streams=true", uuid)
	}
	resp, err := client.FFProxyGET(hostUUID, url)
	fmt.Println(resp.Status())
	fmt.Println(resp.String())
	body := &model.FlowNetwork{}
	_, err = jsonToInterface(resp.Body(), body)
	return body
}

func (inst *App) RestartPluginBulk(connUUID, hostUUID string, pluginUUID []PluginUUIDs) interface{} {
	_, err := inst.resetHost(connUUID, hostUUID, true)
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	for _, plg := range pluginUUID {
		_, err := inst.flow.EnablePlugin(plg.UUID)
		if err != nil {
			inst.crudMessage(false, fmt.Sprintf("enable plugin fail: %s", plg.Name))
		} else {
			inst.crudMessage(true, fmt.Sprintf("enabled plugin:%s", plg.Name))
		}
	}
	return "ok"
}

func (inst *App) ffProxy(connUUID, hostUUID string) error {
	client, err := inst.initConnectionAuth(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return err
	}
	resp, err := client.EdgeGetPoints(hostUUID)
	fmt.Println(err)
	fmt.Println(resp)
	return err
}
