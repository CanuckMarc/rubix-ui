package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeDev/flow-eng/db"
	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/NubeIO/rubix-edge-wires/flow"
	"github.com/NubeIO/rubix-ui/backend/flowcli"
)

var flowEngIP = "0.0.0.0"

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

func (inst *App) nodeValue(connUUID, hostUUID, nodeUUID string) (*node.Values, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/values/%s", nodeUUID)
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *node.Values
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodeValue(connUUID, hostUUID string, isRemote bool, nodeUUID string) *node.Values {
	if isRemote {
		resp, err := inst.nodeValue(connUUID, hostUUID, nodeUUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodeValue(nodeUUID)
	if err != nil {
		return resp
	}
	return resp
}

func (inst *App) nodeValues(connUUID, hostUUID string) ([]node.Values, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/values")
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out []node.Values
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodeValues(connUUID, hostUUID string, isRemote bool) []node.Values {
	if isRemote {
		resp, err := inst.nodeValues(connUUID, hostUUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodeValues()
	if err != nil {
		inst.uiErrorMessage("flow runtime is not running")
		return resp
	}
	return resp
}

func (inst *App) nodeHelp(connUUID, hostUUID string) ([]node.Help, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/values")
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out []node.Help
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodeHelp(connUUID, hostUUID string, isRemote bool) []node.Help {
	if isRemote {
		resp, err := inst.nodeHelp(connUUID, hostUUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodesHelp()
	if err != nil {
		inst.uiErrorMessage("flow runtime is not running")
		return resp
	}
	return resp
}

func (inst *App) nodeHelpByName(connUUID, hostUUID, nodeName string) (*node.Help, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/help/%s", nodeName)
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *node.Help
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodeHelpByName(connUUID, hostUUID string, isRemote bool, nodeName string) *node.Help {
	if isRemote {
		resp, err := inst.nodeHelpByName(connUUID, hostUUID, nodeName)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodeHelpByName(nodeName)
	if err != nil {
		inst.uiErrorMessage("download the node first to edit the settings")
		return resp
	}
	return resp
}

func (inst *App) getFlow(connUUID, hostUUID string) (interface{}, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/flows")
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out interface{}
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) GetFlow(connUUID, hostUUID string, isRemote bool) interface{} {
	if isRemote {
		resp, err := inst.getFlow(connUUID, hostUUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetFlow()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	return resp
}

func (inst *App) nodeSchema(connUUID, hostUUID, nodeName string) (*flowcli.Schema, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/schema/%s", nodeName)
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *flowcli.Schema
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodeSchema(connUUID, hostUUID string, isRemote bool, nodeName string) *flowcli.Schema {
	if isRemote {
		resp, err := inst.nodeSchema(connUUID, hostUUID, nodeName)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodeSchema(nodeName)
	if err != nil {
		inst.uiErrorMessage("download the node first to edit the settings")
		return resp
	}
	return resp
}

func (inst *App) nodePallet(connUUID, hostUUID, filterCategory string) ([]nodes.PalletNode, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/nodes/pallet")
	resp, err := c.ProxyGET(hostUUID, path)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out []nodes.PalletNode
		var outFiltered []nodes.PalletNode
		err := json.Unmarshal(resp.Body(), &out)
		if filterCategory != "" {
			for _, palletNode := range out {
				if palletNode.Category == filterCategory {
					outFiltered = append(outFiltered, palletNode)
				}
			}
			return outFiltered, err
		}
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) NodePallet(connUUID, hostUUID, filterCategory string, isRemote bool) []nodes.PalletNode {
	fmt.Println(filterCategory)
	if isRemote {
		resp, err := inst.nodePallet(connUUID, hostUUID, filterCategory)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodePallet()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	var outFiltered []nodes.PalletNode
	if filterCategory != "" {
		for _, palletNode := range resp {
			if palletNode.Category == filterCategory {
				outFiltered = append(outFiltered, palletNode)
			}
		}
		return outFiltered
	}
	return resp
}

func (inst *App) downloadFlow(connUUID, hostUUID string, encodedNodes interface{}, restartFlow bool) (*flow.Message, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/flows/download")
	resp, err := c.ProxyPOST(hostUUID, path, encodedNodes)
	if err != nil {
		return nil, err
	}
	if resp.IsSuccess() {
		var out *flow.Message
		err := json.Unmarshal(resp.Body(), &out)
		return out, err
	}
	return nil, errors.New(fmt.Sprintf("failed to edit %s:", path))
}

func (inst *App) DownloadFlow(connUUID, hostUUID string, isRemote bool, encodedNodes interface{}, restartFlow bool) *flow.Message {
	if isRemote {
		resp, err := inst.downloadFlow(connUUID, hostUUID, encodedNodes, restartFlow)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		} else {
			inst.uiSuccessMessage(fmt.Sprintf(resp.Message))
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	downloadFlow, err := client.DownloadFlow(encodedNodes, restartFlow)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return downloadFlow
	} else {
		inst.uiSuccessMessage(fmt.Sprintf(downloadFlow.Message))
	}
	return downloadFlow
}

func (inst *App) NodePayload(connUUID, hostUUID string, isRemote bool, payload interface{}, nodeUUID string) *flow.Message {

	return nil
}
