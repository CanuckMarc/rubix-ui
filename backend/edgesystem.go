package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/namings"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *App) EdgeHostReboot(connUUID, hostUUID string) *system.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	inst.uiSuccessMessage("will try reboot, please check connection in around 30 seconds")
	data, err := client.EdgeHostReboot(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return data
}

func (inst *App) EdgeServiceStart(connUUID, hostUUID, appName string) *amodel.Message {
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Enable)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Start)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) EdgeServiceStop(connUUID, hostUUID, appName string) *amodel.Message {
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Disable)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Stop)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) EdgeServiceRestart(connUUID, hostUUID, appName string) *amodel.Message {
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Enable)
	err = inst.errMsg(err)
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, appName, amodel.Restart)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) edgeSystemCtlAction(connUUID, hostUUID, appName string, action amodel.Action) (*amodel.Message, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	serviceName := namings.GetServiceNameFromAppName(appName)
	return client.EdgeSystemCtlAction(hostUUID, serviceName, action)
}
