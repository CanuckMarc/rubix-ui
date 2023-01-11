package assistcli

import (
	"encoding/json"
	"errors"
	"fmt"
)

type WiresExport struct {
	Objects     interface{}
	Errors      []interface{} `json:"errors"`
	ContainerId string        `json:"containerId"`
	Total       int           `json:"total"`
	Message     string        `json:"message"`
}

func (inst *Client) WiresUpload(hostID string, body interface{}) (data interface{}, response *Response) {
	path := fmt.Sprintf("%s/upload", Paths.Wires.Path)
	response = &Response{}
	resp, err := inst.Rest.R().
		SetHeader("host-uuid", hostID).
		SetHeader("host-name", hostID).
		SetBody(body).
		Post(path)
	return resp.String(), response.buildResponse(resp, err)
}

func (inst *Client) WiresBackup(hostID string) (data interface{}, err error) {
	path := fmt.Sprintf("%s/backup", Paths.Wires.Path)
	resp, err := inst.Rest.R().
		SetHeader("host-uuid", hostID).
		SetHeader("host-name", hostID).
		Get(path)
	if resp.IsSuccess() {
		r := &WiresExport{}
		json.Unmarshal(resp.Body(), r)
		return r.Objects, err
	} else {
		if err != nil {
			return nil, err
		}
		return nil, errors.New(fmt.Sprintf("failed to backup wires: %s", resp.String()))
	}
}
