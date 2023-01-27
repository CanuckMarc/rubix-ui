package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"time"
)

type Schedule struct {
	Uuid            string      `json:"uuid"`
	Name            string      `json:"name"`
	Enable          interface{} `json:"enable"`
	ThingClass      string      `json:"thing_class"`
	ThingType       string      `json:"thing_type"`
	IsActive        interface{} `json:"is_active"`
	IsGlobal        interface{} `json:"is_global"`
	Schedule        interface{} `json:"schedule"`
	TimeZone        string      `json:"timezone"`
	ActiveWeekly    bool        `json:"active_weekly"`
	ActiveException bool        `json:"active_exception"`
	ActiveEvent     bool        `json:"active_event"`
	CreatedOn       time.Time   `json:"created_on"`
	UpdatedOn       time.Time   `json:"updated_on"`
}

func (inst *Client) FFGetSchedules(hostIDName string) ([]Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]Schedule{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []Schedule
	out = *resp.Result().(*[]Schedule)
	return out, nil
}

func (inst *Client) FFGetSchedule(hostIDName, uuid string) (*Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Schedule{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Schedule), nil
}

func (inst *Client) FFDeleteSchedule(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/schedules/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) FFAddSchedule(hostIDName string, body *Schedule) (*Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Schedule{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Schedule), nil
}

func (inst *Client) FFEditSchedule(hostIDName, uuid string, body *Schedule) (*Schedule, error) {
	url := fmt.Sprintf("proxy/ff/api/schedules/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Schedule{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Schedule), nil
}
