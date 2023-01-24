package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) ConfigureOpenVPN(uuid string) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/hosts/%s/configure-openvpn", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", uuid).
		SetResult(&amodel.Message{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}
