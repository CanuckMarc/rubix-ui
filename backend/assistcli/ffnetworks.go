package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) FFGetNetworks(hostIDName string, withDevices bool, overrideUrl ...string) ([]model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks")
	if withDevices == true {
		url = fmt.Sprintf("proxy/ff/api/networks?with_devices=true")
	}
	if buildUrl(overrideUrl...) != "" {
		url = buildUrl(overrideUrl...)
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Network{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Network
	out = *resp.Result().(*[]model.Network)
	return out, nil
}

func (inst *Client) FFGetNetworksWithPoints(hostIDName string) ([]model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks?with_points=true")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Network{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Network
	out = *resp.Result().(*[]model.Network)
	return out, nil
}

func (inst *Client) FFGetNetwork(hostIDName, uuid string, withDevices bool, overrideUrl ...string) (*model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks/%s", uuid)
	if withDevices == true {
		url = fmt.Sprintf("proxy/ff/api/networks/%s?with_devices=true", uuid)
	}
	if buildUrl(overrideUrl...) != "" {
		url = buildUrl(overrideUrl...)
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Network{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Network), nil
}

// FFGetNetworkWithPoints get a network with all its devices and points
func (inst *Client) FFGetNetworkWithPoints(hostIDName, uuid string) (*model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks/%s?with_devices=true&with_points=true", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Network{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Network), nil
}

func (inst *Client) FFDeleteNetwork(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/networks/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) FFGetNetworkByPluginName(hostIDName, pluginName string, withPoints ...bool) (*model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks/plugin/%s", pluginName)
	if len(withPoints) > 0 {
		url = fmt.Sprintf("proxy/ff/api/networks/plugin/%s?with_points=true", pluginName)
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Network{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Network), nil
}

func (inst *Client) FFAddNetwork(hostIDName string, body *model.Network, restartPlugin bool) (*model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks?restart_plugin=%t", restartPlugin)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Network{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Network), nil
}

func (inst *Client) FFEditNetwork(hostIDName, uuid string, body *model.Network) (*model.Network, error) {
	url := fmt.Sprintf("proxy/ff/api/networks/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Network{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Network), nil
}
