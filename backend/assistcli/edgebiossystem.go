package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/model"
)

func (inst *Client) EdgeBiosPing(hostIDName string) (*amodel.Message, error) {
	url := fmt.Sprintf("/proxy/eb/api/system/ping")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&amodel.Message{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeBiosDeviceType(hostIDName string) (*model.DeviceType, error) {
	url := fmt.Sprintf("/proxy/eb/api/system/device-type")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.DeviceType{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.DeviceType), nil
}
