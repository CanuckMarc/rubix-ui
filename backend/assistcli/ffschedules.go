package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) FFGetSchedules(hostIDName string) ([]model.Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&[]model.Schedule{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Schedule
	out = *resp.Result().(*[]model.Schedule)
	return out, nil
}

func (inst *Client) FFGetSchedule(hostIDName, uuid string) (*model.Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.Schedule{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Schedule), nil
}

func (inst *Client) FFDeleteSchedule(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/schedules/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) FFAddSchedule(hostIDName string, body *model.Schedule) (*model.Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.Schedule{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Schedule), nil
}

func (inst *Client) FFEditSchedule(hostIDName, uuid string, body *model.Schedule) (*model.Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&model.Schedules{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Schedule), nil
}
