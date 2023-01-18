package backend

import (
	"fmt"
	"github.com/NubeIO/lib-ufw/ufw"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *App) EdgeFirewallList(connUUID, hostUUID string) []ufw.UFWStatus {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeFirewallList(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeFirewallStatus(connUUID, hostUUID string) *ufw.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeFirewallStatus(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeFirewallEnable(connUUID, hostUUID string) *ufw.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeFirewallEnable(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeFirewallDisable(connUUID, hostUUID string) *ufw.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeFirewallDisable(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeFirewallPortOpen(connUUID, hostUUID string, body system.UFWBody) *ufw.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	data, err := client.EdgeFirewallPortOpen(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeFirewallPortClose(connUUID, hostUUID string, body system.UFWBody) *ufw.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	if body.Port == 22 { // shh
		inst.uiErrorMessage(fmt.Sprintf("port %d can not be closed", body.Port))
		return nil
	}
	if body.Port == 1414 { // wires-plat
		inst.uiErrorMessage(fmt.Sprintf("port %d can not be closed", body.Port))
		return nil
	}
	if body.Port == 1662 { // assist
		inst.uiErrorMessage(fmt.Sprintf("port %d can not be closed", body.Port))
		return nil
	}
	if body.Port == 1660 { // ff
		inst.uiErrorMessage(fmt.Sprintf("port %d can not be closed", body.Port))
		return nil
	}
	data, err := client.EdgeFirewallPortClose(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}
