package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-edge/pkg/streamlog"
)

func (inst *Client) EdgeAddLog(hostIDName string, body *streamlog.Log) (*streamlog.Log, error) {
	url := fmt.Sprintf("proxy/api/logs/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&streamlog.Log{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*streamlog.Log), nil
}

func (inst *Client) EdgeGetLogs(hostIDName string) ([]streamlog.Log, error) {
	url := fmt.Sprintf("proxy/api/logs/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]streamlog.Log{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return *resp.Result().(*[]streamlog.Log), nil
}
