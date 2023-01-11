package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) GetFlowNetworkClones(hostIDName string, withStreams ...bool) ([]model.FlowNetworkClone, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_network_clones")
	if len(withStreams) > 0 {
		if withStreams[0] == true {
			url = fmt.Sprintf("proxy/ff/api/flow_network_clones?with_streams=true")
		}
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.FlowNetworkClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.FlowNetworkClone
	out = *resp.Result().(*[]model.FlowNetworkClone)
	return out, nil
}

func (inst *Client) GetFlowNetworkClone(hostIDName, uuid string, withStreams ...bool) (*model.FlowNetworkClone, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_network_clones/%s", uuid)
	if len(withStreams) > 0 {
		if withStreams[0] == true {
			url = fmt.Sprintf("proxy/ff/api/flow_network_clones/%s?with_streams=true", uuid)
		}
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetworkClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.FlowNetworkClone), nil
}

func (inst *Client) GetFlowNetworkClonesWithChild(hostIDName string) ([]model.FlowNetworkClone, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_network_clones?with_streams=true&with_producers=true&with_consumers=true&with_writers=true&with_tags=true")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.FlowNetworkClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.FlowNetworkClone
	out = *resp.Result().(*[]model.FlowNetworkClone)
	return out, nil
}

func (inst *Client) GetFlowNetworkCloneWithChild(hostIDName, uuid string) (*model.FlowNetworkClone, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_network_clones/%s?with_streams=true&with_producers=true&with_consumers=true&with_writers=true&with_tags=true", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetworkClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.FlowNetworkClone), nil
}

func (inst *Client) DeleteFlowNetworkClone(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/flow_network_clones/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}
