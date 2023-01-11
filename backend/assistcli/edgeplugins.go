package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
)

type EdgeUploadResponse struct {
	Destination string `json:"destination"`
	File        string `json:"file"`
	Size        string `json:"size"`
	UploadTime  string `json:"upload_time"`
}

func (inst *Client) EdgeListPlugins(hostIDName string) ([]amodel.Plugin, error, error) {
	url := fmt.Sprintf("/api/edge/plugins")
	resp, connectionErr, requestErr := nresty.FormatRestyV2Response(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]amodel.Plugin{}).
		Get(url))
	if connectionErr != nil || requestErr != nil {
		return nil, connectionErr, requestErr
	}
	data := resp.Result().(*[]amodel.Plugin)
	return *data, nil, nil
}

func (inst *Client) EdgeGetPlugins(hostIDName string) ([]rumodel.Plugin, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/plugins")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]rumodel.Plugin{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	data := resp.Result().(*[]rumodel.Plugin)
	return *data, nil
}

func (inst *Client) EdgeGetPlugin(hostIDName, pluginName string) (*rumodel.Plugin, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/plugins/path/%s", pluginName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&rumodel.Plugin{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*rumodel.Plugin), nil
}

func (inst *Client) EdgeUploadPlugin(hostIDName string, body *amodel.Plugin) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/edge/plugins/upload")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&amodel.Message{}).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeMoveFromDownloadToInstallPlugins(hostIDName string) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/edge/plugins/move-from-download-to-install")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&amodel.Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeDeletePlugin(hostIDName, pluginName, arch string) (*amodel.Message, error) {
	url := fmt.Sprintf("/api/edge/plugins/name/%s?arch=%s", pluginName, arch)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&amodel.Message{}).
		Delete(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*amodel.Message), nil
}

func (inst *Client) EdgeDeleteDownloadPlugins(hostIDName string) (*amodel.Message, error, error) {
	url := fmt.Sprintf("/api/edge/plugins/download-plugins")
	// we use v2 here, coz it shows requestErr when there is no plugins' directory on download path
	resp, connectionErr, requestErr := nresty.FormatRestyV2Response(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&amodel.Message{}).
		Delete(url))
	if connectionErr != nil || requestErr != nil {
		return nil, connectionErr, requestErr
	}
	return resp.Result().(*amodel.Message), nil, nil
}

func (inst *Client) EdgeGetConfigPlugin(hostIDName, pluginName string) (*string, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/plugins/config/%s?by_plugin_name=true", pluginName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Get(url))
	if err != nil {
		return nil, err
	}
	response := resp.String()
	return &response, nil
}

func (inst *Client) EdgeUpdateConfigPlugin(hostIDName, pluginName, config string) (*string, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/plugins/config/%s?by_plugin_name=true", pluginName)
	body := map[string]string{"data": config}
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	response := resp.String()
	return &response, nil
}

func (inst *Client) EdgeEnablePlugin(hostIDName, pluginName string, enable bool) (*string, error) {
	url := fmt.Sprintf("/proxy/edge/ff/api/plugins/enable/%s?by_plugin_name=true", pluginName)
	body := map[string]bool{"enabled": enable}
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(body).
		Post(url))
	if err != nil {
		return nil, err
	}
	state := "enabled"
	if enable == false {
		state = "disabled"
	}
	output := fmt.Sprintf("%s plugin %s successfully", pluginName, state)
	return &output, nil
}

func (inst *Client) EdgeRestartPlugin(hostIDName, pluginName string) (*string, error) {
	url := fmt.Sprintf("proxy/ff/api/plugins/restart/%s?by_plugin_name=true", pluginName)
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		Post(url))
	if err != nil {
		return nil, err
	}
	output := fmt.Sprintf("%s plugin restarted successfully", pluginName)
	return &output, nil
}
