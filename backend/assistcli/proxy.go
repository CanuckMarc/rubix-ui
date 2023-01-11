package assistcli

import (
	"fmt"
	"github.com/go-resty/resty/v2"
	"strings"
)

func (inst *Client) ProxyGET(hostIDName, path string) (*resty.Response, error) {
	path = fmt.Sprintf("proxy/%s", path)
	path = strings.Replace(path, "//", "/", -1) // makes this /api//host/123 => /api/host/123
	resp, err := inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Get(path)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *Client) ProxyPOST(hostIDName, path string, body interface{}) (*resty.Response, error) {
	path = fmt.Sprintf("proxy/%s", path)
	path = strings.Replace(path, "//", "/", -1) // makes this /api//host/123 => /api/host/123
	resp, err := inst.Rest.R().
		SetBody(body).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Post(path)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *Client) ProxyPATCH(hostIDName, path string, body interface{}) (*resty.Response, error) {
	path = fmt.Sprintf("proxy/%s", path)
	path = strings.Replace(path, "//", "/", -1) // makes this /api//host/123 => /api/host/123
	resp, err := inst.Rest.R().
		SetBody(body).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Patch(path)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *Client) ProxyPUT(hostIDName, path string, body interface{}) (*resty.Response, error) {
	path = fmt.Sprintf("proxy/%s", path)
	path = strings.Replace(path, "//", "/", -1) // makes this /api//host/123 => /api/host/123
	resp, err := inst.Rest.R().
		SetBody(body).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Put(path)
	if err != nil {
		return nil, err
	}
	return resp, err
}

func (inst *Client) ProxyDELETE(hostIDName, path string) (*resty.Response, error) {
	path = fmt.Sprintf("proxy/%s", path)
	path = strings.Replace(path, "//", "/", -1) // makes this /api//host/123 => /api/host/123
	resp, err := inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Delete(path)
	if err != nil {
		return nil, err
	}
	return resp, err
}
