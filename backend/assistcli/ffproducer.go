package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

func (inst *Client) AddProducer(hostIDName string, body *model.Producer) (*model.Producer, error) {
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Producer{}).
		SetBody(body).
		Post("proxy/ff/api/producers"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Producer), nil
}

func (inst *Client) EditProducer(hostIDName, uuid string, body *model.Producer) (*model.Producer, error) {
	url := fmt.Sprintf("proxy/ff/api/producers/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Producer{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Producer), nil
}

func (inst *Client) GetProducers(hostIDName string) ([]model.Producer, error) {
	url := fmt.Sprintf("proxy/ff/api/producers")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Producer{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Producer
	out = *resp.Result().(*[]model.Producer)
	return out, nil
}

func (inst *Client) GetProducer(hostIDName, uuid string) (*model.Producer, error) {
	url := fmt.Sprintf("proxy/ff/api/producers/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Producer{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Producer), nil
}

func (inst *Client) DeleteProducer(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/producers/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}
