package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-edge-wires/flow"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"github.com/NubeIO/rubix-ui/backend/flowcli"
	"github.com/bsm/ratelimit"
	"github.com/mitchellh/mapstructure"
	log "github.com/sirupsen/logrus"
	"time"
)

var flowEngIP = "0.0.0.0"

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
			// inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
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

func (inst *App) nodesValuesInsideParent(connUUID, hostUUID, parentID string) ([]node.Values, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/api/nodes/values/parent/%s", parentID)
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

func (inst *App) NodesValuesInsideParent(connUUID, hostUUID, parentID string, isRemote bool) []node.Values {
	if isRemote {
		resp, err := inst.nodesValuesInsideParent(connUUID, hostUUID, parentID)
		if err != nil {
			// inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodesValuesInsideParent(parentID)
	if err != nil {
		inst.uiErrorMessage("flow runtime is not running")
		return resp
	}
	return resp
}

func (inst *App) nodesValuesSubFlow(connUUID, hostUUID, parentID string) ([]node.Values, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/api/nodes/values/sub/%s", parentID)
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

func (inst *App) NodesValuesSubFlow(connUUID, hostUUID, parentID string, isRemote bool) []node.Values {
	if isRemote {
		resp, err := inst.nodesValuesSubFlow(connUUID, hostUUID, parentID)
		if err != nil {
			// inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodesValuesSubFlow(parentID)
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

type Help struct {
	NodeName string `json:"name"`
	Help     string `json:"help"`
}

func (inst *App) NodeHelpByName(connUUID, hostUUID string, isRemote bool, nodeName string) *Help {
	out := &Help{}
	if isRemote {
		resp, err := inst.nodeHelpByName(connUUID, hostUUID, nodeName)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return out
		}
		return &Help{
			NodeName: resp.NodeName,
			Help:     resp.Help,
		}
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodeHelpByName(nodeName)
	if err != nil {
		inst.uiErrorMessage("download the node first to edit the settings")
		return out
	}
	return &Help{
		NodeName: resp.NodeName,
		Help:     resp.Help,
	}
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

func (inst *App) GetFlowByNodeType(connUUID, hostUUID, nodeType string, isRemote bool) interface{} {
	if isRemote {
		resp, err := inst.getFlow(connUUID, hostUUID)
		nodeList := &nodes.NodesList{}
		mapstructure.Decode(resp, &nodeList)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		out := &nodes.NodesList{}
		if nodeList != nil {
			for _, schema := range nodeList.Nodes {
				if schema.Type == nodeType {
					out.Nodes = append(out.Nodes, schema)
				}
			}
		}
		log.Infof("nodes uploaded from backend count: %d", len(nodeList.Nodes))
		return out
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetFlowByNodeType(nodeType)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	log.Infof("nodes uploaded from backend count: %d", len(resp.Nodes))
	return resp
}

func (inst *App) GetFlow(connUUID, hostUUID string, isRemote bool) interface{} {
	if isRemote {
		resp, err := inst.getFlow(connUUID, hostUUID)
		nodeList := &nodes.NodesList{}
		mapstructure.Decode(resp, &nodeList)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		log.Infof("nodes uploaded from backend count: %d", len(nodeList.Nodes))
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetFlow()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	log.Infof("nodes uploaded from backend count: %d", len(resp.Nodes))
	return resp
}

func (inst *App) GetSubFlow(connUUID, hostUUID, subFlowID string, isRemote bool) interface{} {
	nodeIds := &flowcli.NodesList{}
	nodeIds.Nodes = append(nodeIds.Nodes, subFlowID)
	return inst.GetFlowList(connUUID, hostUUID, nodeIds, isRemote)
}

func (inst *App) getFlowList(connUUID, hostUUID string, nodeIds *flowcli.NodesList) (interface{}, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	path := fmt.Sprintf("/wires/api/flows/export/nodes/")
	resp, err := c.ProxyPOST(hostUUID, path, nodeIds)
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

func (inst *App) GetFlowList(connUUID, hostUUID string, nodeIds *flowcli.NodesList, isRemote bool) interface{} {
	if nodeIds != nil {
		nodeIds.GetChilds = true
	}
	if nodeIds == nil {
		inst.uiErrorMessage(" node id's can not be empty")
		return nil
	}
	if nodeIds.Nodes == nil {
		inst.uiErrorMessage(" node id's can not be empty")
		return nil
	}
	log.Infof("nodes export list count: %d", len(nodeIds.Nodes))
	log.Infof("nodes id's: %s", nodeIds.Nodes)
	if isRemote {
		resp, err := inst.getFlowList(connUUID, hostUUID, nodeIds)
		nodeList := &nodes.NodesList{}
		mapstructure.Decode(resp, &nodeList)
		log.Infof("nodes uploaded from backend count: %d", len(nodeList.Nodes))
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.GetFlowList(nodeIds)

	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return resp
	}
	if resp != nil {
		log.Infof("nodes sent from backend count: %d", len(resp.Nodes))
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
			// inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
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
	if isRemote {
		resp, err := inst.nodePallet(connUUID, hostUUID, filterCategory)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return []nodes.PalletNode{}
		}
		return resp
	}
	var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
	resp, err := client.NodePallet()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return []nodes.PalletNode{}
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

var downloadRateLimit = ratelimit.New(1, 5*time.Second)

func (inst *App) DownloadFlow(connUUID, hostUUID string, isRemote bool, encodedNodes interface{}, restartFlow bool) *flow.Message {
	nodeList := &nodes.NodesList{}
	mapstructure.Decode(encodedNodes, &nodeList)
	log.Infof("nodes sent from ui count: %d", len(nodeList.Nodes))
	if isRemote {
		if downloadRateLimit.Limit() {
			inst.uiWarningMessage("downloads are limited to one every 5 seconds")
			return nil
		}
		resp, err := inst.downloadFlow(connUUID, hostUUID, encodedNodes, restartFlow)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		} else {
			inst.uiSuccessMessage(fmt.Sprintf(resp.Message)) // download ok
			time.Sleep(1500 * time.Millisecond)
			_, err := inst.edgeSystemCtlAction(connUUID, hostUUID, constants.RubixEdgeWiresServiceName, amodel.Restart) // restart edge-wires
			if err != nil {
				inst.uiErrorMessage("failed to restart rubix-edge-wires")
				return nil
			}
			inst.uiSuccessMessage("restarted rubix-edge-wires ok")
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

func (inst *App) nodePayload(connUUID, hostUUID string, payload interface{}, nodeId string) (*flow.Message, error) {
	c, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	// /api/nodes/payload/78C2708D74DC4D9995B881CA9870E1F0
	path := fmt.Sprintf("/wires/api/nodes/payload/%s", nodeId)
	resp, err := c.ProxyPOST(hostUUID, path, payload)
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

func (inst *App) NodePayload(connUUID, hostUUID string, isRemote bool, payload interface{}, nodeId string) *flow.Message {
	p := &node.Payload{
		Any: payload,
	}
	if isRemote {
		resp, err := inst.nodePayload(connUUID, hostUUID, p, nodeId)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return nil
		}
		return resp
	} else {
		var client = flowcli.New(&flowcli.Connection{Ip: flowEngIP})
		resp, err := client.NodePayload(nodeId, p)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return resp
		}
		return resp
	}
}
