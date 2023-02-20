package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/utils/urls"
)

func (inst *Client) GetStreamClones(hostIDName string) ([]model.StreamClone, error) {
	url := fmt.Sprintf("proxy/ff/api/stream_clones")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.StreamClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.StreamClone
	out = *resp.Result().(*[]model.StreamClone)
	return out, nil
}

func (inst *Client) GetStreamClone(hostIDName, uuid string, withConsumer, withWriters bool) (*model.StreamClone, error) {
	url := fmt.Sprintf("proxy/ff/api/stream_clones/%s", uuid)
	if withConsumer {
		url = urls.AttachQueryParams(url, "with_consumers=true")
	}
	if withWriters {
		url = urls.AttachQueryParams(url, "with_writers=true")
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.StreamClone{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.StreamClone), nil
}

func (inst *Client) DeleteStreamClone(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/stream_clones/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) SyncStreamClones(hostIDName, fncUUID string) (*[]rumodel.SyncModel, error) {
	url := fmt.Sprintf(
		"proxy/ff/api/flow_network_clones/%s/sync/stream_clones?with_consumers=true&with_writers=true", fncUUID)
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

func (inst *Client) SyncWriterClones(hostIDName, consumerUUID string) (*[]rumodel.SyncModel, error) {
	url := fmt.Sprintf("proxy/ff/api/producers/%s/sync/writer_clones", consumerUUID)
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
