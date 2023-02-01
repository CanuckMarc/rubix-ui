package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) GetLocations() (data []amodel.Location, response *Response) {
	path := Paths.Location.Path
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&[]amodel.Location{}).
		Get(path)
	return *resp.Result().(*[]amodel.Location), response.buildResponse(resp, err)
}

func (inst *Client) GetLocation(uuid string) (data *amodel.Location, response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Location.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetResult(&amodel.Location{}).
		Get(path)
	return resp.Result().(*amodel.Location), response.buildResponse(resp, err)
}

func (inst *Client) AddLocation(body *amodel.Location) (*amodel.Location, error) {
	path := fmt.Sprintf(Paths.Location.Path)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Location{}).
		Post(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Location), nil
}

func (inst *Client) UpdateLocation(uuid string, body *amodel.Location) (*amodel.Location, error) {
	path := fmt.Sprintf("%s/%s", Paths.Location.Path, uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetBody(body).
		SetResult(&amodel.Location{}).
		Patch(path))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Location), nil
}

func (inst *Client) DeleteLocation(uuid string) (response *Response) {
	path := fmt.Sprintf("%s/%s", Paths.Location.Path, uuid)
	response = &Response{}
	resp, err := inst.Rest.R().
		Delete(path)
	return response.buildResponse(resp, err)
}

func (inst *Client) GetLocationSchema() string {
	path := fmt.Sprintf("%s/%s", Paths.Location.Path, "schema")
	resp, err := inst.Rest.R().
		Get(path)
	if err != nil {
		return "{}"
	}
	return string(resp.Body())
}
