package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
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

// GetStreamsByFlowNetwork all stream under a flow network
func (inst *Client) GetStreamsByFlowNetwork(hostIDName, flowUUID string) ([]*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/flow_networks/%s?with_streams=true", flowUUID)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&model.FlowNetwork{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	streams := resp.Result().(*model.FlowNetwork)
	return streams.Streams, nil
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

func (inst *Client) GetStream(hostIDName, uuid string) (*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams/%s", uuid)
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

func (inst *Client) GetStreamsWithChild(hostIDName string) ([]model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams?flow_networks=true&producers=true&consumers=true&command_groups=false&writers=true&tags=true")
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

func (inst *Client) GetStreamWithChild(hostIDName, uuid string) (*model.Stream, error) {
	url := fmt.Sprintf("proxy/ff/api/streams/%s?flow_networks=true&producers=true&consumers=true&command_groups=false&writers=true&tags=true", uuid)
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
