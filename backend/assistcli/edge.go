package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) EdgeProductInfo(hostIDName string) (*model.Product, error) {
	url := fmt.Sprintf("/api/edge/system/product")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.Product{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Product), nil
}

func (inst *Client) EdgeSystemCtlAction(hostIDName, serviceName string, action model.Action) (*model.Message, error) {
	url := fmt.Sprintf("/proxy/edge/api/systemctl/%s?unit=%s", action, serviceName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Message), nil
}

func (inst *Client) EdgeSystemCtlState(hostIDName, serviceName string) (*model.AppSystemState, error) {
	url := fmt.Sprintf("/proxy/edge/api/systemctl/state?unit=%s", serviceName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.AppSystemState{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.AppSystemState), nil
}
