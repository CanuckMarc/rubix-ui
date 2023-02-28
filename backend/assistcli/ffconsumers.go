package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/utils/urls"
)

func (inst *Client) AddConsumer(hostIDName string, body *model.Consumer) (*model.Consumer, error) {
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Consumer{}).
		SetBody(body).
		Post("proxy/ff/api/consumers"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Consumer), nil
}

func (inst *Client) GetConsumers(hostIDName string) ([]model.Consumer, error) {
	url := fmt.Sprintf("proxy/ff/api/consumers")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Consumer{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Consumer
	out = *resp.Result().(*[]model.Consumer)
	return out, nil
}

func (inst *Client) GetConsumer(hostIDName, uuid string, withWriters bool) (*model.Consumer, error) {
	url := fmt.Sprintf("proxy/ff/api/consumers/%s", uuid)
	if withWriters {
		url = urls.AttachQueryParams(url, "with_writers=true")
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Consumer{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Consumer), nil
}

func (inst *Client) EditConsumer(hostIDName, uuid string, body *model.Consumer) (*model.Consumer, error) {
	url := fmt.Sprintf("proxy/ff/api/consumers/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Consumer{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Consumer), nil
}

func (inst *Client) DeleteConsumer(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/consumers/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) SyncConsumers(hostIDName, streamCloneUUID string) (*[]rumodel.SyncModel, error) {
	url := fmt.Sprintf(
		"proxy/ff/api/stream_clones/%s/sync/consumers?with_writers=true", streamCloneUUID)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]rumodel.SyncModel{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*[]rumodel.SyncModel), nil
}
