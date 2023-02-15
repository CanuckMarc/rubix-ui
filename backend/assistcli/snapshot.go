package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) EdgeGetSnapshots(hostIDName string) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshot")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}

func (inst *Client) EdgeCreateSnapshot(hostIDName, file string, useGlobalUUID bool) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshot/create/%s %s", file, fmt.Sprint(useGlobalUUID))
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}

func (inst *Client) EdgeRestoreSnapshot(hostIDName, file string, useGlobalUUID bool) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshot/restore/%s %s", file, fmt.Sprint(useGlobalUUID))
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}
