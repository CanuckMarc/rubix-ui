package backend

import (
	"errors"
	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/mitchellh/mapstructure"
	"strings"
)

// GetNodesAllFlowNetworks all nodes of type flow/flow-network
func (inst *App) GetNodesAllFlowNetworks(connUUID, hostUUID string, isRemote bool) interface{} {
	return inst.GetNodesByType(connUUID, hostUUID, "flow/flow-network", isRemote)
}

// GetNodesAllFlowNetworksChildren all nodes of type flow under parent
func (inst *App) GetNodesAllFlowNetworksChildren(connUUID, hostUUID, subFlowID string, isRemote bool) interface{} {
	resp := inst.GetSubFlow(connUUID, hostUUID, subFlowID, isRemote)
	nodeList := &nodes.NodesList{}
	var nodesByType []*node.Schema
	mapstructure.Decode(resp, &nodeList)
	for _, schema := range nodeList.Nodes {
		nodeCategory, _, _ := decodeType(schema.Type)
		if nodeCategory == "flow" {
			nodesByType = append(nodesByType, schema)
		}
	}
	return nodesByType
}

func decodeType(nodeType string) (category, name string, err error) {
	parts := strings.Split(nodeType, "/")
	if len(parts) > 1 {
		return parts[0], parts[1], nil
	}
	return "", "", errors.New("failed to get category and name from node-type")
}

func (inst *App) GetNodesByType(connUUID, hostUUID, nodeType string, isRemote bool) interface{} {
	resp := inst.GetFlow(connUUID, hostUUID, isRemote)
	nodeList := &nodes.NodesList{}
	var nodesByType []*node.Schema
	mapstructure.Decode(resp, &nodeList)
	for _, schema := range nodeList.Nodes {
		_, nodeByType, _ := decodeType(schema.Type)
		if nodeByType == nodeType {
			nodesByType = append(nodesByType, schema)
		}
	}
	return nodesByType
}

func (inst *App) GetNodesByCategory(connUUID, hostUUID, category string, isRemote bool) interface{} {
	resp := inst.GetFlow(connUUID, hostUUID, isRemote)
	nodeList := &nodes.NodesList{}
	var nodesByType []*node.Schema
	mapstructure.Decode(resp, &nodeList)
	for _, schema := range nodeList.Nodes {
		nodeCategory, _, _ := decodeType(schema.Type)
		if nodeCategory == category {
			nodesByType = append(nodesByType, schema)
		}
	}
	return nodesByType
}
