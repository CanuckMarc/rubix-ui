package assistcli

import (
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"gopkg.in/yaml.v3"
)

type BacnetClient struct {
	Debug    bool     `json:"debug" yaml:"debug"`
	Enable   bool     `json:"enable" yaml:"enable"`
	Commands []string `json:"commands" yaml:"commands"`
}

type Mqtt struct {
	BrokerIp          string `json:"broker_ip"  yaml:"broker_ip"`
	BrokerPort        int    `json:"broker_port"  yaml:"broker_port"`
	Debug             bool   `json:"debug" yaml:"debug"`
	Enable            bool   `json:"enable" yaml:"enable"`
	WriteViaSubscribe bool   `json:"write_via_subscribe" yaml:"write_via_subscribe"`
	RetryEnable       bool   `json:"retry_enable" yaml:"retry_enable"`
	RetryLimit        int    `json:"retry_limit" yaml:"retry_limit"`
	RetryInterval     int    `json:"retry_interval" yaml:"retry_interval"`
}

type ConfigBACnetServer struct {
	ServerName   string       `json:"server_name" yaml:"server_name"`
	DeviceId     int          `json:"device_id" yaml:"device_id"`
	Port         int          `json:"port" yaml:"port"`
	Iface        string       `json:"iface" yaml:"iface"`
	BiMax        int          `json:"bi_max" yaml:"bi_max"`
	BoMax        int          `json:"bo_max" yaml:"bo_max"`
	BvMax        int          `json:"bv_max" yaml:"bv_max"`
	AiMax        int          `json:"ai_max" yaml:"ai_max"`
	AoMax        int          `json:"ao_max" yaml:"ao_max"`
	AvMax        int          `json:"av_max" yaml:"av_max"`
	Objects      []string     `json:"objects" yaml:"objects"`
	Properties   []string     `json:"properties" yaml:"properties"`
	Mqtt         Mqtt         `json:"mqtt" yaml:"mqtt"`
	BacnetClient BacnetClient `json:"bacnet_client" yaml:"bacnet_client"`
}

// EdgeWriteConfig replace the config file of a nube app
func (inst *Client) EdgeWriteConfig(hostIDName, appName string) (*Message, error) {
	pushConfig := false
	var writeConfig amodel.EdgeConfig
	if appName == constants.BacnetServerDriver {
		pushConfig = true
		resp, connectionErr, requestErr := inst.EdgeReadConfig(hostIDName, appName, constants.ConfigYml)
		var config ConfigBACnetServer
		if connectionErr != nil {
			return nil, connectionErr
		}
		if requestErr != nil {
			config = ConfigBACnetServer{}
		}
		if resp != nil {
			err := yaml.Unmarshal(resp.Data, &config)
			if err != nil {
				return nil, err
			}
		}
		writeConfig = amodel.EdgeConfig{
			AppName:    constants.BacnetServerDriver,
			Body:       inst.defaultWrapperBACnetConfig(config),
			ConfigName: constants.ConfigYml,
		}
	}
	if appName == constants.RubixWires {
		pushConfig = true
		config := `
PORT=1313
SECRET_KEY=__SECRET_KEY__
`
		writeConfig = amodel.EdgeConfig{
			AppName:      constants.RubixWires,
			BodyAsString: config,
			ConfigName:   constants.ConfigEnv,
		}
	}
	if pushConfig {
		url := fmt.Sprintf("/api/edge/config")
		resp, err := nresty.FormatRestyResponse(inst.Rest.R().
			SetHeader("host-uuid", hostIDName).
			SetHeader("host-name", hostIDName).
			SetResult(&Message{}).
			SetBody(writeConfig).
			Post(url))
		if err != nil {
			return nil, err
		}
		return resp.Result().(*Message), nil
	}
	return nil, nil
}

func (inst *Client) EdgeReadConfig(hostIDName, appName, configName string) (*amodel.EdgeConfigResponse, error, error) {
	url := fmt.Sprintf("/api/edge/config?app_name=%s&config_name=%s", appName, configName)
	resp, connectionError, requestErr := nresty.FormatRestyV2Response(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&amodel.EdgeConfigResponse{}).
		Get(url))
	if connectionError != nil || requestErr != nil {
		return nil, connectionError, requestErr
	}
	return resp.Result().(*amodel.EdgeConfigResponse), nil, nil
}

func (inst *Client) BACnetWriteConfig(hostIDName, appName string, config ConfigBACnetServer) (*Message, error) {
	var writeConfig amodel.EdgeConfig
	if appName == constants.BacnetServerDriver {
		writeConfig = amodel.EdgeConfig{
			AppName:    constants.BacnetServerDriver,
			Body:       inst.defaultWrapperBACnetConfig(config),
			ConfigName: constants.ConfigYml,
		}
	} else {
		return nil, errors.New(fmt.Sprintf("app name must be bacnet: %s", appName))
	}
	url := fmt.Sprintf("/api/edge/config")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		SetBody(writeConfig).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}

func (inst *Client) defaultWrapperBACnetConfig(config ConfigBACnetServer) ConfigBACnetServer {
	if config.ServerName == "" {
		config.ServerName = "Nube IO"
	}
	if config.DeviceId == 0 {
		config.DeviceId = 2508
	}
	if config.Iface == "" {
		config.Iface = "eth0"
	}

	config.Objects = []string{"ai", "av", "ao", "bi", "bo", "bv"}
	config.Properties = []string{"name", "pv", "pri"}

	config.BacnetClient.Commands = []string{"whois", "read_value", "write_value"}

	if config.Mqtt.BrokerIp == "" {
		config.Mqtt.BrokerIp = "127.0.0.1"
	}
	if config.Mqtt.BrokerPort == 0 {
		config.Mqtt.BrokerPort = 1883
	}
	if config.Mqtt.RetryLimit == 0 {
		config.Mqtt.RetryLimit = 5
	}
	if config.Mqtt.RetryInterval == 0 {
		config.Mqtt.RetryInterval = 10
	}
	return config
}
