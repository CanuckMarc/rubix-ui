package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-edge/service/system"
	log "github.com/sirupsen/logrus"
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

func (inst *App) EdgeServiceStart(connUUID, hostUUID, serviceName string) *amodel.Message {
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Enable)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Start)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) EdgeServiceStop(connUUID, hostUUID, serviceName string) *amodel.Message {
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Disable)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Stop)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) EdgeServiceRestart(connUUID, hostUUID, serviceName string) *amodel.Message {
	log.Infof("restart has been called...%s", serviceName)
	ctl, err := inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Enable)
	err = inst.errMsg(err)
	ctl, err = inst.edgeSystemCtlAction(connUUID, hostUUID, serviceName, amodel.Restart)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	return ctl
}

func (inst *App) edgeSystemCtlAction(connUUID, hostUUID, serviceName string, action amodel.Action) (*amodel.Message, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeSystemCtlAction(hostUUID, serviceName, action)
}
