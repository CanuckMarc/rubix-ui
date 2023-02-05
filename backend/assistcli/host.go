package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
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

func (inst *Client) AddHost(body *amodel.Host) (data *amodel.Host, err error) {
	path := fmt.Sprintf(Paths.Hosts.Path)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Host{}).
		Post(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Host), nil
}

func (inst *Client) UpdateHost(uuid string, body *amodel.Host) (data *amodel.Host, err error) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Host{}).
		Patch(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Host), nil
}

func (inst *Client) DeleteHost(uuid string) (response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		Delete(path)
	return response.buildResponse(resp, err)
}

func (inst *Client) GetHostSchema() string {
	path := fmt.Sprintf("%s/%s", Paths.Hosts.Path, "schema")
	resp, err := inst.Rest.R().
		Get(path)
	if err != nil {
		return "{}"
	}
	return string(resp.Body())
}
