package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-registry-go/rubixregistry"
	"github.com/NubeIO/rubix-ui/backend/constants"
)

func (inst *Client) GetEdgeDeviceInfo(hostIDName string) (*rubixregistry.DeviceInfo, error) {
	url := fmt.Sprintf("/proxy/edge/api/system/device")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&rubixregistry.DeviceInfo{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	deviceInfo := resp.Result().(*rubixregistry.DeviceInfo)
	if deviceInfo.DeviceType == "" {
		deviceInfo.DeviceType = constants.RubixCompute.String()
	}
	return deviceInfo, nil
}

func (inst *Client) UpdateEdgeDeviceInfo(hostIDName string, body *rubixregistry.DeviceInfo) (*rubixregistry.DeviceInfo,
	error) {
	url := fmt.Sprintf("/proxy/edge/api/system/device")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(body).
		SetResult(&rubixregistry.DeviceInfo{}).
		Patch(url))
	if err != nil {
		return nil, err
	}
	deviceInfo := resp.Result().(*rubixregistry.DeviceInfo)
	if deviceInfo.DeviceType == "" {
		deviceInfo.DeviceType = constants.RubixCompute.String()
	}
	return deviceInfo, nil
}

func (inst *Client) EdgeSystemCtlAction(hostIDName, serviceName string, action amodel.Action) (*amodel.Message, error) {
	url := fmt.Sprintf("/proxy/edge/api/systemctl/%s?unit=%s", action, serviceName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&amodel.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeSystemCtlState(hostIDName, serviceName string) (*amodel.AppSystemState, error) {
	url := fmt.Sprintf("/proxy/edge/api/systemctl/state?unit=%s", serviceName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&amodel.AppSystemState{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.AppSystemState), nil
}
