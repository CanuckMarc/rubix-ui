package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/utils/urls"
)

// AddStreamToExistingFlow add a stream to an existing flow
func (inst *Client) AddStreamToExistingFlow(hostIDName, flowNetworkUUID string, body *model.Stream) (*model.Stream, error) {
	flowNetwork := &model.FlowNetwork{
		CommonFlowNetwork: model.CommonFlowNetwork{
			CommonUUID: model.CommonUUID{
				UUID: flowNetworkUUID,
			},
		},
	}
	body.FlowNetworks = append(body.FlowNetworks, flowNetwork)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Stream{}).
		SetBody(body).
		Post("proxy/ff/api/streams/"))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Stream), nil
}

func (inst *Client) GetStreams(hostIDName string) ([]model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams/")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]model.Stream{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []model.Stream
	out = *resp.Result().(*[]model.Stream)
	return out, nil
}

func (inst *Client) GetStream(hostIDName, uuid string, withProducers, withWriterClones bool) (*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams/%s", uuid)
	if withProducers {
		url = urls.AttachQueryParams(url, "with_producers=true")
	}
	if withWriterClones {
		url = urls.AttachQueryParams(url, "with_writer_clones=true")
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Stream{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Stream), nil
}

func (inst *Client) GetStreamFromFNC(hostIDName, fncUUID, uuid string, withProducers, withWriterClones bool) (*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/fnc/%s/api/streams/%s", fncUUID, uuid)
	if withProducers {
		url = urls.AttachQueryParams(url, "with_producers=true")
	}
	if withWriterClones {
		url = urls.AttachQueryParams(url, "with_writer_clones=true")
	}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Stream{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Stream), nil
}

func (inst *Client) EditStream(hostIDName, uuid string, body *model.Stream) (*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams/%s", uuid)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.Stream{}).
		SetBody(body).
		Patch(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*model.Stream), nil
}

func (inst *Client) DeleteStream(hostIDName, uuid string) (bool, error) {
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetPathParams(map[string]string{"uuid": uuid}).
		Delete("proxy/ff/api/streams/{uuid}"))
	if err != nil {
		return false, err
	}
	return true, nil
}

func (inst *Client) SyncStreams(hostIDName, flowNetworkUUID string) (*[]rumodel.SyncModel, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_networks/%s/sync/streams?with_producers=true&with_writer_clones=true",
		flowNetworkUUID)
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
