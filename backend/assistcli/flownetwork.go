package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/utils/urls"
)

func (inst *Client) AddFlowNetwork(hostIDName string, body *model.FlowNetwork) (*model.FlowNetwork, error) {
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetwork{}).
		SetBody(body).
		Post("proxy/ff/api/flow_networks"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.FlowNetwork), nil
}

func (inst *Client) GetFlowNetworks(hostIDName string, withStreams bool, overrideUrl ...string) ([]model.FlowNetwork, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_networks")
	if withStreams == true {
		url = fmt.Sprintf("proxy/ff/api/flow_networks?with_streams=true")
	}
	if buildUrl(overrideUrl...) != "" {
		url = buildUrl(overrideUrl...)
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.FlowNetwork{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.FlowNetwork
	out = *resp.Result().(*[]model.FlowNetwork)
	return out, nil
}

func (inst *Client) GetFlowNetwork(hostIDName, uuid string, withStreams bool) (*model.FlowNetwork, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_networks/%s", uuid)
	if withStreams {
		url = urls.AttachQueryParams(url, "with_streams=true")
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetwork{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.FlowNetwork), nil
}

func (inst *Client) EditFlowNetwork(hostIDName, uuid string, body *model.FlowNetwork) (*model.FlowNetwork, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_networks/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetwork{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.FlowNetwork), nil
}

func (inst *Client) DeleteFlowNetwork(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/flow_networks/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}
