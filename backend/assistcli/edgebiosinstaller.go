package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/edgebioscli/ebmodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) EdgeBiosRubixEdgeUpload(hostIDName string, upload amodel.FileUpload) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/eb/re/upload")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(upload).
		SetResult(&amodel.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeBiosRubixEdgeInstall(hostIDName string, upload amodel.FileUpload) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/eb/re/install")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(upload).
		SetResult(&amodel.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeBiosRubixEdgeVersion(hostIDName string) (*ebmodel.Version, error) {
	url := fmt.Sprintf("/api/eb/re/version")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&ebmodel.Version{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*ebmodel.Version), nil
}
