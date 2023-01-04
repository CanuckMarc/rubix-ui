package flowcli

import (
	"fmt"
	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/NubeIO/rubix-edge-wires/clients/nresty"
)

type SchemaBody struct {
	Title      string      `json:"title"`
	Properties interface{} `json:"properties"`
}

type Schema struct {
	Schema   SchemaBody  `json:"schema"`
	UiSchema interface{} `json:"uiSchema"`
}

func (inst *FlowClient) NodeValue(nodeUUID string) (*node.Values, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&node.Values{}).
		Get(fmt.Sprintf("/api/nodes/values/%s", nodeUUID)))

	if err != nil {
		return nil, err
	}
	return resp.Result().(*node.Values), nil
}

// NodesValuesInsideParent get all the node current values from the runtime for one parent
func (inst *FlowClient) NodesValuesInsideParent(parentID string) ([]node.Values, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]node.Values{}).
		Get(fmt.Sprintf("/api/nodes/values/parent/%s", parentID)))
	if err != nil {
		return nil, err
	}
	var out []node.Values
	out = *resp.Result().(*[]node.Values)
	return out, nil
}

// NodesValuesSubFlow get all the node current values from the runtime for a parent node with sub-flow inputs and outputs values
func (inst *FlowClient) NodesValuesSubFlow(parentID string) ([]node.Values, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]node.Values{}).
		Get(fmt.Sprintf("/api/nodes/values/sub/%s", parentID)))
	if err != nil {
		return nil, err
	}
	var out []node.Values
	out = *resp.Result().(*[]node.Values)
	return out, nil
}

func (inst *FlowClient) NodeValues() ([]node.Values, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]node.Values{}).
		Get("/api/nodes/values"))
	if err != nil {
		return nil, err
	}
	var out []node.Values
	out = *resp.Result().(*[]node.Values)
	return out, nil
}

func (inst *FlowClient) NodesHelp() ([]node.Help, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]node.Help{}).
		Get("/api/nodes/help"))
	if err != nil {
		return nil, err
	}
	var out []node.Help
	out = *resp.Result().(*[]node.Help)
	return out, nil
}

func (inst *FlowClient) NodeHelpByName(nodeName string) (*node.Help, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&node.Help{}).
		Get(fmt.Sprintf("/api/nodes/help/%s", nodeName)))

	if err != nil {
		return nil, err
	}
	return resp.Result().(*node.Help), nil
}

func (inst *FlowClient) NodeSchema(nameName string) (*Schema, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&Schema{}).
		Get(fmt.Sprintf("/api/nodes/schema/%s", nameName)))

	if err != nil {
		return nil, err
	}
	return resp.Result().(*Schema), nil
}

func (inst *FlowClient) NodePallet() ([]nodes.PalletNode, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]nodes.PalletNode{}).
		Get("/api/nodes/pallet"))
	if err != nil {
		return nil, err
	}
	var out []nodes.PalletNode
	out = *resp.Result().(*[]nodes.PalletNode)
	return out, nil
}

func (inst *FlowClient) GetBaseNodesList() ([]node.Spec, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&[]node.Spec{}).
		Get("/api/nodes"))
	if err != nil {
		return nil, err
	}
	var out []node.Spec
	out = *resp.Result().(*[]node.Spec)
	return out, nil
}
