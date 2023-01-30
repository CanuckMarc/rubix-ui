package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
)

func (inst *Client) GetHostNetworks() (data []amodel.Network, response *Response) {
	path := fmt.Sprintf(Paths.HostNetwork.Path)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&[]amodel.Network{}).
		Get(path)
	return *resp.Result().(*[]amodel.Network), response.buildResponse(resp, err)
}

func (inst *Client) GetHostNetwork(uuid string) (data *amodel.Network, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&amodel.Network{}).
		Get(path)
	return resp.Result().(*amodel.Network), response.buildResponse(resp, err)
}

func (inst *Client) AddHostNetwork(body *amodel.Network) (data *amodel.Network, response *Response) {
	path := fmt.Sprintf(Paths.HostNetwork.Path)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Network{}).
		Post(path)
	return resp.Result().(*amodel.Network), response.buildResponse(resp, err)
}

func (inst *Client) UpdateHostNetwork(uuid string, body *amodel.Network) (data *amodel.Network, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Network{}).
		Patch(path)
	return resp.Result().(*amodel.Network), response.buildResponse(resp, err)
}

func (inst *Client) DeleteHostNetwork(uuid string) (response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.HostNetwork.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		Delete(path)
	return response.buildResponse(resp, err)
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
