package chirpstack

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
)

const limit = "200"
const orgID = "1"

// GetOrganizations get all
func (inst *ChirpClient) GetOrganizations() (*Organizations, error) {
	q := fmt.Sprintf("/organizations?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Organizations{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Organizations), nil
}

// GetGateways get all
func (inst *ChirpClient) GetGateways() (*Gateways, error) {
	q := fmt.Sprintf("/gateways?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Gateways{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Gateways), nil
}

// GetApplications get all
func (inst *ChirpClient) GetApplications() (*Applications, error) {
	q := fmt.Sprintf("/applications?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Applications{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Applications), nil
}

// GetDevices get all
func (inst *ChirpClient) GetDevices(applicationID string) (*Devices, error) {
	q := fmt.Sprintf("/devices?limit=%s&applicationID=%s", limit, applicationID)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Devices{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Devices), nil
}

// GetDeviceProfiles get all
func (inst *ChirpClient) GetDeviceProfiles() (*DeviceProfiles, error) {
	q := fmt.Sprintf("/device-profiles?limit=%s", limit)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(DeviceProfiles{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*DeviceProfiles), nil
}

// GetServiceProfiles get all
func (inst *ChirpClient) GetServiceProfiles() (*ServiceProfiles, error) {
	q := fmt.Sprintf("/service-profiles?limit=%s&organizationID=%s", limit, orgID)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(ServiceProfiles{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*ServiceProfiles), nil
}

// GetGatewayProfiles get all
func (inst *ChirpClient) GetGatewayProfiles() (*GatewayProfiles, error) {
	q := fmt.Sprintf("/gateway-profiles?limit=%s&organizationID=%s", limit, orgID)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(GatewayProfiles{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*GatewayProfiles), nil
}

// AddDevice add all
func (inst *ChirpClient) AddDevice(body Devices) (*Devices, error) {
	q := fmt.Sprintf("/devices")
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Devices{}).
		SetBody(body).
		Post(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Devices), nil
}

// GetDevice get an object
func (inst *ChirpClient) GetDevice(devEui string) (*Device, error) {
	q := fmt.Sprintf("/devices/%s", devEui)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Device{}).
		Get(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Device), nil
}

// EditDevice edit object
func (inst *ChirpClient) EditDevice(devEui string, body *Device) (*Device, error) {
	q := fmt.Sprintf("/devices/%s", devEui)
	resp, err := nresty.FormatRestyResponse(inst.client.R().
		SetResult(Device{}).
		SetBody(body).
		Put(q))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Device), nil
}

// DeleteDevice delete
func (inst *ChirpClient) DeleteDevice(devEui string) (bool, error) {
	q := fmt.Sprintf("/devices/%s", devEui)
	_, err := nresty.FormatRestyResponse(inst.client.R().
		Delete(q))
	if err != nil {
		return false, err
	}
	return true, nil
}
