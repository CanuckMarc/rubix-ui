package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) GetHostNetworks() ([]amodel.Network, error) {
	path := fmt.Sprintf(Paths.HostNetwork.Path)
	resp, err := inst.Rest.R().
		SetResult(&[]amodel.Network{}).
		Get(path)
	if err != nil {
		return nil, err
	}
	return *resp.Result().(*[]amodel.Network), nil
}

func (inst *Client) GetHostNetwork(uuid string) (*amodel.Network, error) {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(&amodel.Network{}).
		Get(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Network), nil
}

func (inst *Client) AddHostNetwork(body *amodel.Network) (*amodel.Network, error) {
	path := fmt.Sprintf(Paths.HostNetwork.Path)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Network{}).
		Post(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Network), nil
}

func (inst *Client) UpdateHostNetwork(uuid string, body *amodel.Network) (*amodel.Network, error) {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Network{}).
		Patch(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Network), nil
}

func (inst *Client) UpdateHostsStatus(uuid string) (*amodel.Network, error) {
	path := fmt.Sprintf("%s/%s/%s", Paths.HostNetwork.Path, uuid, "update-hosts-status")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(&amodel.Network{}).
		Get(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Network), nil
}

func (inst *Client) DeleteHostNetwork(uuid string) error {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		Delete(path))
	if err != nil {
		return err
	}
	return nil
}

func (inst *Client) GetNetworkSchema() string {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, "schema")
	resp, err := inst.Rest.R().
		Get(path)
	if err != nil {
		return "{}"
	}
	return string(resp.Body())
}
