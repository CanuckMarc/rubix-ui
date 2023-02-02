package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeDev/flow-eng/db"
	"github.com/NubeIO/rubix-ui/backend/flowcli"
)

func (inst *App) getWiresConnections(connUUID, hostUUID string) ([]db.Connection, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := "/wires/api/connections/"
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}

	if resp.IsSuccess() {
		var out []db.Connection
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to get %s:", path))
}

func (inst *App) GetWiresConnections(connUUID, hostUUID string, isRemote bool) []db.Connection {
	if isRemote {
		resp, err := inst.getWiresConnections(connUUID, hostUUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetConnections()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	return resp
}

func (inst *App) updateWiresConnection(connUUID, hostUUID, uuid string, body *db.Connection) (*db.Connection, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/connections/%s", uuid)
	resp, err := c.ProxyPATCH(hostUUID, path, body)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *db.Connection
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) UpdateWiresConnection(connUUID, hostUUID string, isRemote bool, uuid string, body *db.Connection) *db.Connection {
	if isRemote {
		resp, err := inst.updateWiresConnection(connUUID, hostUUID, uuid, body)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.UpdateConnection(uuid, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	return resp
}

func (inst *App) addWiresConnection(connUUID, hostUUID string, body *db.Connection) (*db.Connection, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/connections/")
	resp, err := c.ProxyPOST(hostUUID, path, body)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *db.Connection
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to add %s:", path))
}

func (inst *App) AddWiresConnection(connUUID, hostUUID string, isRemote bool, body *db.Connection) *db.Connection {
	if isRemote {
		resp, err := inst.addWiresConnection(connUUID, hostUUID, body)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.AddConnection(body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	return resp
}

func (inst *App) BulkDeleteWiresConnection(connUUID, hostUUID string, isRemote bool, uuids []string) interface{} {
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		if isRemote {
			err := inst.remoteDeleteWiresConnection(connUUID, hostUUID, item)
			if err != nil {
				errorCount++
				inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			} else {
				addedCount++
			}
		} else {
			err := inst.deleteWiresConnection(item)
			if err != nil {
				errorCount++
				inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			} else {
				addedCount++
			}
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("delete count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to delete count: %d", errorCount))
	}
	return nil
}

func (inst *App) remoteDeleteWiresConnection(connUUID, hostUUID, uuid string) error {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return err
	}
	path := fmt.Sprintf("/wires/api/connections/%s", uuid)
	resp, err := c.ProxyDELETE(hostUUID, path)
	if err != nil {
		return err
	}
	if resp.IsSuccess() {
		return nil
	}
	return errors.New(fmt.Sprintf("failed to delete %s:", path))
}

func (inst *App) deleteWiresConnection(uuid string) error {
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	err := client.DeleteConnection(uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	inst.uiSuccessMessage(fmt.Sprintf("ok"))
	return nil
}

func (inst *App) DeleteWiresConnection(connUUID, hostUUID string, isRemote bool, uuid string) {
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	err := client.DeleteConnection(uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return
	}
	inst.uiSuccessMessage(fmt.Sprintf("ok"))
}

func (inst *App) getWiresConnection(connUUID, hostUUID, uuid string) (*db.Connection, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/connections/%s", uuid)
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *db.Connection
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) GetWiresConnection(connUUID, hostUUID string, isRemote bool, uuid string) *db.Connection {
	if isRemote {
		resp, err := inst.getWiresConnection(connUUID, hostUUID, uuid)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetConnection(uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	return resp
}
