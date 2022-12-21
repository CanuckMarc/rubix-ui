package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *Client) EdgeRestartNetworking(hostIDName string) (*system.Message, error) {
	url := fmt.Sprintf("proxy/api/networking/networks/restart/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(system.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}

func (inst *Client) EdgeInterfaceUpDown(hostIDName string, port system.NetworkingBody) (*system.Message, error) {
	url := fmt.Sprintf("proxy/api/networking/networks/interfaces/reset/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(port).
		SetResult(system.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}

func (inst *Client) EdgeInterfaceUp(hostIDName string, port system.NetworkingBody) (*system.Message, error) {
	url := fmt.Sprintf("proxy/api/networking/networks/interfaces/up/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(port).
		SetResult(system.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}

func (inst *Client) EdgeInterfaceDown(hostIDName string, port system.NetworkingBody) (*system.Message, error) {
	url := fmt.Sprintf("proxy/api/networking/networks/interfaces/down/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(port).
		SetResult(system.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}
