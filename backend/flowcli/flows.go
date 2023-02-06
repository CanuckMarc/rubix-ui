package flowcli

import (
	"fmt"
	"github.com/NubeDev/flow-eng/node"
	"github.com/NubeDev/flow-eng/nodes"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-edge-wires/flow"
)

func (inst *FlowClient) NodePayload(nodeId string, payload *node.Payload) (*flow.Message, error) {
	path := fmt.Sprintf("/api/nodes/payload/%s", nodeId)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&flow.Message{}).
		SetBody(payload).
		Post(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*flow.Message), nil
}

func (inst *FlowClient) GetFlow() (*nodes.NodesList, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&nodes.NodesList{}).
		Get("/api/flows"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*nodes.NodesList), nil
}

func (inst *FlowClient) GetSubFlow(subFlowID string) (*nodes.NodesList, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&nodes.NodesList{}).
		Get(fmt.Sprintf("/api/flows/export/parent/%s", subFlowID)))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*nodes.NodesList), nil
}

type NodesList struct {
	Nodes     []string `json:"nodes"`
	GetChilds bool     `json:"get_childs"`
}

func (inst *FlowClient) GetFlowList(nodesIds *NodesList) (*nodes.NodesList, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&nodes.NodesList{}).
		SetBody(nodesIds).
		Post("/api/flows/export/nodes"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*nodes.NodesList), nil
}

func (inst *FlowClient) DownloadFlow(encodedNodes interface{}, restartFlow bool) (*flow.Message, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&flow.Message{}).
		SetBody(encodedNodes).
		Post("/api/flows/download"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*flow.Message), nil
}

func (inst *FlowClient) FlowStart() (*flow.Message, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&flow.Message{}).
		Post("/api/flows/start"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*flow.Message), nil
}

func (inst *FlowClient) FlowRestart() (*flow.Message, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&flow.Message{}).
		Post("/api/flows/restart"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*flow.Message), nil
}

func (inst *FlowClient) FlowStop() (*flow.Message, error) {
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(&flow.Message{}).
		Post("/api/flows/stop"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*flow.Message), nil
}
