package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/mitchellh/mapstructure"
)

// GetNodesAllFlowNetworks all nodes of type flow/flow-network
func (inst *App) GetNodesAllFlowNetworks(connUUID, hostUUID string, isRemote bool) []*node.Schema {
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

func (inst *App) GetNodesByType(connUUID, hostUUID, nodeType string, isRemote bool) []*node.Schema {
	resp := inst.GetFlow(connUUID, hostUUID, isRemote)
	nodeList := &nodes.NodesList{}
	var nodesByType []*node.Schema
	mapstructure.Decode(resp, &nodeList)
	for _, schema := range nodeList.Nodes {
		cat, nodeByType, _ := decodeType(schema.Type)
		if nodeType == fmt.Sprintf("%s/%s", cat, nodeByType) {
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

type BacnetPoints struct {
	AVExisting []int `json:"av_existing"`
	BVExisting []int `json:"bv_existing"`
}

func (inst *App) GetBacnetFreeAddress(connUUID, hostUUID string, isRemote bool) *BacnetPoints {
	encodedNodes := inst.GetBacnetNodes(connUUID, hostUUID, isRemote)
	pointsList := &BacnetPoints{}
	for _, schema := range encodedNodes {
		_, nodeName, _ := decodeType(schema.Type)
		if nodeName == "analog-variable" {
			settings, err := getBacnetSettings(schema.Settings)
			if err == nil {
				pointsList.AVExisting = append(pointsList.AVExisting, settings.InstanceNumber)
			}
		}
		if nodeName == "binary-variable" {
			settings, err := getBacnetSettings(schema.Settings)
			if err == nil {
				pointsList.BVExisting = append(pointsList.BVExisting, settings.InstanceNumber)
			}
		}
	}
	return pointsList

}

func (inst *App) GetBacnetNodes(connUUID, hostUUID string, isRemote bool) []*node.Schema {
	encodedNodes := inst.GetNodesByCategory(connUUID, hostUUID, "bacnet", isRemote)
	var nodeList []*node.Schema
	var out []*node.Schema
	marshal, err := json.Marshal(encodedNodes)
	if err != nil {
		return nodeList
	}
	err = json.Unmarshal(marshal, &nodeList)
	if err != nil {
		return nodeList
	}
	for _, schema := range nodeList {
		_, nodeName, _ := decodeType(schema.Type)
		if nodeName == "analog-variable" {
			out = append(out, schema)
		}
		if nodeName == "binary-variable" {
			out = append(out, schema)
		}
	}
	return out
}

func (inst *App) NextFreeBacnetAddress(nums []int) int {
	sort.Ints(nums[:])
	var nextFree int
	for i, num := range nums {
		i++
		if i != num {
			nextFree = i
			break
		}
	}
	return nextFree
}

type bacnetPointSettings struct {
	InstanceNumber int `json:"instance-number"`
}

func getBacnetSettings(body map[string]interface{}) (*bacnetPointSettings, error) {
	settings := &bacnetPointSettings{}
	marshal, err := json.Marshal(body)
	if err != nil {
		return settings, err
	}
	err = json.Unmarshal(marshal, &settings)
	return settings, err
}
