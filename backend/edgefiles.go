package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/constants"
)

func appPaths(appName string) string {
	root := "data"
	db := "data/data.db"
	switch appName {
	case constants.RubixEdgeWires:
		return fmt.Sprintf("/%s/%s/%s", root, constants.RubixEdgeWires, db)
	case constants.FlowFramework:
		return fmt.Sprintf("/%s/%s/%s", root, constants.FlowFramework, db)
	}
	return ""
}

// EdgeDeleteAppDB only allow a delete in the data dir
func (inst *App) EdgeDeleteAppDB(connUUID, hostUUID, appName string) *assistcli.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	path := appPaths(appName)
	if path == "" {
		inst.uiErrorMessage(fmt.Sprintf("app %s doesn't support deleting the db", appName))
		return nil
	}
	resp, err := client.EdgeDeleteDataFile(hostUUID, path)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) EdgeFileExists(connUUID, hostUUID, path string) *assistcli.FilesExists {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeFileExists(hostUUID, path)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

// EdgeDeleteDataFile only allow a delete in the data dir
func (inst *App) EdgeDeleteDataFile(connUUID, hostUUID, path string) *assistcli.Message {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	resp, err := client.EdgeDeleteDataFile(hostUUID, path)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}
