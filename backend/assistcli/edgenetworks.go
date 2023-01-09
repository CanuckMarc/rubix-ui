package assistcli

import (
	"fmt"
	"github.com/NubeIO/lib-dhcpd/dhcpd"
	"github.com/NubeIO/lib-networking/networking"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *Client) EdgeGetNetworks(hostIDName string) ([]networking.NetworkInterfaces, error) {
	url := fmt.Sprintf("/proxy/edge/api/networking/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&[]networking.NetworkInterfaces{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	data := resp.Result().(*[]networking.NetworkInterfaces)
	return *data, nil
}

// EdgeDHCPPortExists check if the interface is a static or fixed ip, will return true if port is a set to dhcp
func (inst *Client) EdgeDHCPPortExists(hostIDName string, body *system.NetworkingBody) (*system.DHCPPortExists, error) {
	url := fmt.Sprintf("/proxy/edge/api/networking/interfaces/exists")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&system.DHCPPortExists{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.DHCPPortExists), nil
}

func (inst *Client) EdgeDHCPSetAsAuto(hostIDName string, body *system.NetworkingBody) (*system.Message, error) {
	url := fmt.Sprintf("/proxy/edge/api/networking/interfaces/auto")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&system.Message{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}

func (inst *Client) EdgeDHCPSetStaticIP(hostIDName string, body *dhcpd.SetStaticIP) (string, error) {
	url := fmt.Sprintf("/proxy/edge/api/networking/interfaces/static")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(body).
		Post(url))
	if err != nil {
		return "", err
	}
	return resp.String(), nil
}

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
