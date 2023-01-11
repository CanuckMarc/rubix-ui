package assistcli

import (
	"fmt"
	"time"

	"github.com/NubeIO/lib-date/datelib"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-edge/service/system"
)

func (inst *Client) EdgeSystemTime(hostIDName string) (*datelib.Time, error) {
	url := fmt.Sprintf("proxy/api/time/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&datelib.Time{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*datelib.Time), nil
}

func (inst *Client) EdgeGetHardwareTZ(hostIDName string) (string, error) {
	url := fmt.Sprintf("proxy/api/timezone/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		Get(url))
	if err != nil {
		return "", err
	}
	return resp.String(), nil
}

func (inst *Client) EdgeGetTimeZoneList(hostIDName string) ([]string, error) {
	url := fmt.Sprintf("proxy/api/timezone/list/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetResult(&[]string{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return *resp.Result().(*[]string), nil
}

func (inst *Client) EdgeUpdateTimezone(hostIDName string, timeZone string) (*system.Message, error) {
	url := fmt.Sprintf("proxy/api/timezone/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(system.DateBody{TimeZone: timeZone}).
		SetResult(&system.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*system.Message), nil
}

func (inst *Client) EdgeUpdateSystemTime(hostIDName, timeString string) (*datelib.Time, error) {
	url := fmt.Sprintf("proxy/api/time/")
	layout := "2006-01-02 15:04:05"
	// parse time
	_, err := time.Parse(layout, timeString)
	if err != nil {
		return nil, fmt.Errorf("could not parse date try 2006-01-02 15:04:05 %s", err)
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host_uuid", hostIDName).
		SetHeader("host_name", hostIDName).
		SetBody(system.DateBody{DateTime: timeString}).
		SetResult(&datelib.Time{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*datelib.Time), nil
}
