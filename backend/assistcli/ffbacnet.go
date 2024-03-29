package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

type WhoIsOpts struct {
	InterfacePort   string `json:"interface_port"`
	LocalDeviceIP   string `json:"local_device_ip"`
	LocalDevicePort int    `json:"local_device_port"`
	LocalDeviceId   int    `json:"local_device_id"`
	Low             int    `json:"low"`
	High            int    `json:"high"`
	GlobalBroadcast bool   `json:"global_broadcast"`
	NetworkNumber   uint16 `json:"network_number"`
}

const bacnetMaster = "bacnetmaster"

// BacnetMasterWhoIs do a whois on an existing network
func (inst *Client) BacnetMasterWhoIs(hostIDName string, body *WhoIsOpts) ([]model.Device, error) {
	url := "proxy/ff/api/plugins/api/bacnetmaster/master/whois"
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(body).
		SetResult(&[]model.Device{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	out := *resp.Result().(*[]model.Device)
	return out, nil
}

// BacnetWhoIs do a whois on an existing network
func (inst *Client) BacnetWhoIs(hostIDName string, body *WhoIsOpts, networkUUID string, addDevices bool) ([]model.Device, error) {
	url := fmt.Sprintf("proxy/ff/api/plugins/api/%s/whois/%s?add_devices=%t", bacnetMaster, networkUUID, addDevices)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(body).
		SetResult(&[]model.Device{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	out := *resp.Result().(*[]model.Device)
	return out, nil
}

// BacnetDevicePoints get points from an added device
func (inst *Client) BacnetDevicePoints(hostIDName, deviceUUID string, addPoints, makeWriteable bool) ([]model.Point, error) {
	url := fmt.Sprintf("proxy/ff/api/plugins/api/%s/device/points/%s?add_points=%t&writeable_points=%t", bacnetMaster, deviceUUID, addPoints, makeWriteable)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Point{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	out := *resp.Result().(*[]model.Point)
	return out, nil
}
