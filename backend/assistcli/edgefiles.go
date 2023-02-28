package assistcli

import (
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"strings"
)

type FilesExists struct {
	File   string `json:"file"`
	Exists bool   `json:"exists"`
}

func (inst *Client) EdgeFileExists(hostIDName, path string) (*FilesExists, error) {
	url := fmt.Sprintf("proxy/api/files/exists/?file=%s", path)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&FilesExists{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*FilesExists), nil
}

func (inst *Client) EdgeDeleteDataFile(hostIDName, path string) (*Message, error) {
	if path == "/" {
		return nil, errors.New("the root dir can not be deleted")
	}
	if path == "/data" {
		return nil, errors.New("the /data dir can not be deleted")
	}
	if !strings.Contains(path, "/data") {
		return nil, errors.New(fmt.Sprintf("path %s must be in the /data dir", path))
	}
	url := fmt.Sprintf("proxy/api/files/delete/?file=%s", path)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Delete(url))
	fmt.Println(resp.String())
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}
