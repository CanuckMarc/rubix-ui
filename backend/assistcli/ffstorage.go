package assistcli

import (
	"errors"
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

// GetLocalStorage this api is used for when flow-networks need to talk between each other
func (inst *Client) GetLocalStorage(hostIDName string) (*model.LocalStorageFlowNetwork, error) {
	url := fmt.Sprintf("proxy/ff/api/localstorage_flow_network")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.LocalStorageFlowNetwork{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.LocalStorageFlowNetwork), nil
}

// UpdateLocalStorage this api is used for when flow-networks need to talk between each other
func (inst *Client) UpdateLocalStorage(hostIDName string, body *model.LocalStorageFlowNetwork) (*model.LocalStorageFlowNetwork, error) {
	if body == nil {
		return nil, errors.New("body can not be empty")
	}
	if body.FlowPort == 0 {
		body.FlowPort = 1660
	}
	url := fmt.Sprintf("proxy/ff/api/localstorage_flow_network")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(body).
		SetResult(&model.LocalStorageFlowNetwork{}).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.LocalStorageFlowNetwork), nil
}
