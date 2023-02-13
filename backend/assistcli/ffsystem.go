package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) FFSystemPing(hostIDName string) (*amodel.Message, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/system/ping")
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Get(url))
	if err != nil {
		return nil, err
	}
	return &amodel.Message{Message: "ping success"}, nil
}
