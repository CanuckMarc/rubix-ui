package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/chirpstack"
)

// most nube supported sensors are now added as OTA devices

const limit = "200"

// CSLogin to CS with username and password to get token if not provided in config
func (inst *Client) CSLogin(hostIDName, user, pass string) (string, error) {
	token := &CSLoginToken{}
	csURLConnect := "proxy/chirp/api/internal/login"
	_, err := inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetBody(CSCredentials{
			Email:    user,
			Password: pass,
		}).
		SetResult(&token).
		Post(csURLConnect)
	if token != nil {
		return token.Token, err
	}
	return "", err
}

type CSApplications struct {
	Result []struct {
		ID string `json:"id"`
	} `json:"result"`
}

type CSCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CSLoginToken struct {
	Token string `json:"jwt"`
}

// CSGetApplications get all
func (inst *Client) CSGetApplications(hostIDName, token string) (*chirpstack.Applications, error) {
	q := fmt.Sprintf("proxy/chirp/api/applications?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Applications{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Applications), nil
}

// CSGetDevices get all
func (inst *Client) CSGetDevices(hostIDName, token, applicationID string) (*chirpstack.Devices, error) {
	q := fmt.Sprintf("proxy/chirp/api/devices?limit=%s&applicationID=%s", limit, applicationID)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Devices{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Devices), nil
}

// CSGetDevice get a device
func (inst *Client) CSGetDevice(hostIDName, token, devEui string) (*chirpstack.Device, error) {
	q := fmt.Sprintf("proxy/chirp/api/devices/%s", devEui)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Device{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Device), nil
}

// CSGetDeviceProfiles get all
func (inst *Client) CSGetDeviceProfiles(hostIDName, token string) (*chirpstack.DeviceProfiles, error) {
	q := fmt.Sprintf("proxy/chirp/api/device-profiles?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.DeviceProfiles{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.DeviceProfiles), nil
}

// CSGetGateways get all gateways
func (inst *Client) CSGetGateways(hostIDName, token string) (*chirpstack.Gateways, error) {
	q := fmt.Sprintf("proxy/chirp/api/gateways?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Gateways{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Gateways), nil
}

// CSAddDevice add all
func (inst *Client) CSAddDevice(hostIDName, token string, body *chirpstack.Device) (*chirpstack.Device, error) {
	q := fmt.Sprintf("proxy/chirp/api/devices")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Device{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		SetBody(body).
		Post(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Device), nil
}

// CSEditDevice edit object
func (inst *Client) CSEditDevice(hostIDName, token, devEui string, body *chirpstack.Device) (*chirpstack.Device, error) {
	q := fmt.Sprintf("proxy/chirp/api/devices/%s", devEui)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.Device{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		SetBody(body).
		Put(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.Device), nil
}

// CSDeleteDevice delete
func (inst *Client) CSDeleteDevice(hostIDName, token, devEui string) (bool, error) {
	q := fmt.Sprintf("/devices/%s", devEui)
	_, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		Delete(q))
	if err != nil {
		return false, err
	}
	return true, nil
}

// CSDeviceKeys active a device
func (inst *Client) CSDeviceKeys(hostIDName, token, devEui string, body *chirpstack.DeviceKey) (*chirpstack.DeviceKey, error) {
	q := fmt.Sprintf("/devices/%s/keys", devEui)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.DeviceKey{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		SetBody(body).
		Put(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.DeviceKey), nil
}

// CSActivateDevice active a device
func (inst *Client) CSActivateDevice(hostIDName, token, devEui string, body *chirpstack.DeviceActivation) (*chirpstack.DeviceActivation, error) {
	q := fmt.Sprintf("/devices/%s/activate", devEui)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetResult(chirpstack.DeviceActivation{}).
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetHeader("cs-token", token).
		SetBody(body).
		Put(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*chirpstack.DeviceActivation), nil
}
