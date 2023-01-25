package assistcli

import (
	"encoding/json"
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
)

func (inst *Client) GetHosts() (data []amodel.Host, response *Response) {
	path := fmt.Sprintf(Paths.Hosts.Path)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&[]amodel.Host{}).
		Get(path)
	return *resp.Result().(*[]amodel.Host), response.buildResponse(resp, err)
}

func (inst *Client) GetHost(uuid string) (data *amodel.Host, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&amodel.Host{}).
		Get(path)
	return resp.Result().(*amodel.Host), response.buildResponse(resp, err)
}

func (inst *Client) AddHost(body *amodel.Host) (data *amodel.Host, response *Response) {
	path := fmt.Sprintf(Paths.Hosts.Path)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Host{}).
		Post(path)
	return resp.Result().(*amodel.Host), response.buildResponse(resp, err)
}

func (inst *Client) UpdateHost(uuid string, body *amodel.Host) (data *amodel.Host, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Host{}).
		Patch(path)
	return resp.Result().(*amodel.Host), response.buildResponse(resp, err)
}

func (inst *Client) DeleteHost(uuid string) (response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		Delete(path)
	return response.buildResponse(resp, err)
}

func (inst *Client) GetHostSchema() (data *amodel.HostSchema, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, "schema")
	response = &Response{}
	resp, err := inst.Rest.R().
		Get(path)
	var result *amodel.HostSchema
	err = json.Unmarshal(resp.Body(), &result)
	return result, response.buildResponse(resp, err)
}

func (inst *Client) UpdateStatus() (data []amodel.Host, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, "update-status")
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&[]amodel.Host{}).
		Get(path)
	return *resp.Result().(*[]amodel.Host), response.buildResponse(resp, err)
}
