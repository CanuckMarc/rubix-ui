package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) AddDevice(hostIDName string, device *model.Device) (*model.Device, error) {
	url := fmt.Sprintf("proxy/ff/api/devices")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Device{}).
		SetBody(device).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Device), nil
}

func (inst *Client) GetDevices(hostIDName string, withPoints ...bool) ([]model.Device, error) {
	url := fmt.Sprintf("proxy/ff/api/devices")
	if len(withPoints) > 0 {
		if withPoints[0] == true {
			url = fmt.Sprintf("proxy/ff/api/devices?with_points=true")
		}
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Device{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Device
	out = *resp.Result().(*[]model.Device)
	return out, nil
}

func (inst *Client) GetDevice(hostIDName, uuid string, withPoints ...bool) (*model.Device, error) {
	url := fmt.Sprintf("proxy/ff/api/devices/%s", uuid)
	if len(withPoints) > 0 {
		if withPoints[0] == true {
			url = fmt.Sprintf("proxy/ff/api/devices/%s?with_points=true", uuid)
		}
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Device{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Device), nil
}

func (inst *Client) EditDevice(hostIDName, uuid string, device *model.Device) (*model.Device, error) {
	url := fmt.Sprintf("proxy/ff/api/devices/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Device{}).
		SetBody(device).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Device), nil
}

func (inst *Client) DeleteDevice(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/devices/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}
