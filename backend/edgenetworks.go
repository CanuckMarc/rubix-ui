package backend

import (
	"fmt"
	"github.com/NubeIO/lib-dhcpd/dhcpd"
	"github.com/NubeIO/lib-networking/networking"
	"github.com/NubeIO/lib-schema/schema"
	"github.com/NubeIO/rubix-edge/service/system"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"strings"
)

func (inst *App) EdgeGetNetworks(connUUID, hostUUID string) []networking.NetworkInterfaces {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil
	}
	data, err := client.EdgeGetNetworks(hostUUID)
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var networks []networking.NetworkInterfaces
	for _, net := range data {
		docker := strings.Contains(net.Interface, "docker")
		br := strings.Contains(net.Interface, "br-")
		if docker || br { // don't show the user these networks
		} else {
			networks = append(networks, net)
		}
	}
	return networks
}

type IpSettings struct {
	Type     string   `json:"type" default:"string"`
	Title    string   `json:"title" default:"ip setting"`
	Options  []string `json:"enum" default:"[\"Select option...\",\"dhcp-dynamic\",\"static-fixed\"]"`
	EnumName []string `json:"enumNames" default:"[\"Select option...\",\"dhcp-dynamic\",\"static-fixed\"]"`
	Default  string   `json:"default" default:"Select option..."`
	ReadOnly bool     `json:"readOnly" default:"false"`
}

type IpSettingState struct {
	Type     string `json:"type" default:"string"`
	Title    string `json:"title" default:"current network setting"`
	Default  string `json:"default" default:"interface not found"`
	ReadOnly bool   `json:"readOnly" default:"true"`
}

type Eth0 struct {
	Eth0IpSettings      IpSettings       `json:"eth0_ip_settings"`
	Eth0IpSettingsState IpSettingState   `json:"eth0_ip_settings_state"`
	Eth0Interface       schema.Interface `json:"eth0_interface"`
	Eth0Ip              schema.Ip        `json:"eth0_ip"`
	Eth0Netmask         schema.Netmask   `json:"eth0_netmask"`
	Eth0Gateway         schema.Ip        `json:"eth0_gateway"`
}

type Eth1 struct {
	Eth1IpSettings      IpSettings       `json:"eth1_ip_settings"`
	Eth1IpSettingsState IpSettingState   `json:"eth1_ip_settings_state"`
	Eth1Interface       schema.Interface `json:"eth1_interface"`
	Eth1Ip              schema.Ip        `json:"eth1_ip"`
	Eth1Netmask         schema.Netmask   `json:"eth1_netmask"`
	Eth1Gateway         schema.Ip        `json:"eth1_gateway"`
}

type RcNetwork struct {
	Eth0 `json:"eth0"`
	Eth1 `json:"eth1"`
}

type RcIONetwork struct {
	Eth0 `json:"eth0"`
}

type RcNetworkBody struct {
	Eth0IpSettings string `json:"eth0_ip_settings"`
	Eth0Interface  string `json:"eth0_interface"`
	Eth0Ip         string `json:"eth0_ip"`
	Eth0Netmask    string `json:"eth0_netmask"`
	Eth0Gateway    string `json:"eth0_gateway"`
	Eth1IpSettings string `json:"eth1_ip_settings"`
	Eth1Interface  string `json:"eth1_interface"`
	Eth1Ip         string `json:"eth1_ip"`
	Eth1Netmask    string `json:"eth1_netmask"`
	Eth1Gateway    string `json:"eth1_gateway"`
}

const (
	dhcpDynamic = "dhcp-dynamic"
	staticFixed = "static-fixed"
)

func (inst *App) RcSetNetworks(connUUID, hostUUID string, rcNetworkBody *RcNetworkBody) {
	if rcNetworkBody == nil {
		inst.uiErrorMessage(fmt.Sprintf("edit networks body can not be empty"))
	}
	if rcNetworkBody.Eth0IpSettings == "" && rcNetworkBody.Eth1IpSettings == "" {
		inst.uiErrorMessage("ip setting cant not be empty, please select dhcp-dynamic or static")
		return
	}
	if rcNetworkBody.Eth0Interface == "" && rcNetworkBody.Eth1Interface == "" {
		inst.uiErrorMessage("network interface eth0 or eth1 must be provided")
		return
	}

	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return
	}
	deviceInfo, err := assistClient.GetEdgeDeviceInfo(hostUUID)
	if deviceInfo == nil || err != nil {
		if err != nil {
			inst.uiErrorMessage(err)
		}
		inst.uiErrorMessage("failed to get device info")
		return
	}
	deviceType := deviceInfo.DeviceType

	if deviceType == constants.RubixCompute.String() || deviceType == constants.RubixCompute5.String() || deviceType == constants.RubixComputeIO.String() {

	} else {
		inst.uiErrorMessage("networks can only be updated on a nube-io device")
		return
	}
	// set ETH0
	if rcNetworkBody.Eth0Interface != "" {
		inst.uiSuccessMessage(fmt.Sprintf("try and update eth0 as %s with ip: %s", rcNetworkBody.Eth0IpSettings, rcNetworkBody.Eth0Ip))
		if rcNetworkBody.Eth0IpSettings == dhcpDynamic {
			resp, err := inst.EdgeDHCPSetAsAuto(connUUID, hostUUID, &system.NetworkingBody{
				PortName: "eth0",
			})
			if err != nil {
				inst.uiErrorMessage(err.Error())
				return
			}
			inst.uiSuccessMessage(fmt.Sprintf(resp.Message))
			return
		}
		if rcNetworkBody.Eth0IpSettings == staticFixed {
			_, err := inst.EdgeDHCPSetStaticIP(connUUID, hostUUID, &dhcpd.SetStaticIP{
				Ip:                   rcNetworkBody.Eth0Ip,
				NetMask:              rcNetworkBody.Eth0Netmask,
				IFaceName:            "eth0",
				GatewayIP:            rcNetworkBody.Eth0Gateway,
				DnsIP:                "8.8.8.8",
				CheckInterfaceExists: false,
				SaveFile:             true,
			})
			if err != nil {
				inst.uiErrorMessage(err.Error())
				return
			}
			inst.uiSuccessMessage("update eth0 to fixed ip ok, please now reboot or repower the device")
			return
		}
	}
	// set ETH1
	if rcNetworkBody.Eth1Interface != "" {
		inst.uiSuccessMessage(fmt.Sprintf("try and update eth1 as %s with ip: %s", rcNetworkBody.Eth1IpSettings, rcNetworkBody.Eth1Ip))
		if rcNetworkBody.Eth1IpSettings == dhcpDynamic {
			resp, err := inst.EdgeDHCPSetAsAuto(connUUID, hostUUID, &system.NetworkingBody{
				PortName: "eth1",
			})
			if err != nil {
				inst.uiErrorMessage(err.Error())
				return
			}
			inst.uiSuccessMessage(fmt.Sprintf(resp.Message))
			return
		}
		if rcNetworkBody.Eth1IpSettings == staticFixed {
			_, err := inst.EdgeDHCPSetStaticIP(connUUID, hostUUID, &dhcpd.SetStaticIP{
				Ip:                   rcNetworkBody.Eth1Ip,
				NetMask:              rcNetworkBody.Eth1Netmask,
				IFaceName:            "eth1",
				GatewayIP:            rcNetworkBody.Eth1Gateway,
				DnsIP:                "8.8.8.8",
				CheckInterfaceExists: false,
				SaveFile:             true,
			})
			if err != nil {
				inst.uiErrorMessage(err.Error())
				return
			}
			inst.uiSuccessMessage("update eth1 to fixed ip ok, please now reboot or repower the device")
			return
		}
	}
}

func (inst *App) EdgeDHCPSetAsAuto(connUUID, hostUUID string, body *system.NetworkingBody) (*system.Message, error) {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, err
	}
	resp, err := client.EdgeDHCPSetAsAuto(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, err
	}
	return resp, nil
}

func (inst *App) EdgeDHCPSetStaticIP(connUUID, hostUUID string, body *dhcpd.SetStaticIP) (string, error) {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "", err
	}
	resp, err := client.EdgeDHCPSetStaticIP(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return "", err
	}
	return resp, nil
}

func (inst *App) setEth0(connUUID, hostUUID string, eth0Body networking.NetworkInterfaces) Eth0 {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	m := Eth0{}
	eth0IsDHCP, err := client.EdgeDHCPPortExists(hostUUID, &system.NetworkingBody{PortName: constants.Eth0}) // if exists show the user if set to dhcp or static
	if err != nil {
		m.Eth0IpSettingsState.Default = fmt.Sprintf("eth0 err%s", err.Error())
	}
	// eth0
	if eth0IsDHCP != nil {
		if eth0IsDHCP.InterfaceExists {
			if eth0IsDHCP.IsDHCP {
				m.Eth0IpSettingsState.Default = "eth0 is set to dhcp"
			} else {
				m.Eth0IpSettingsState.Default = "eth0 is set to static"
			}
		}
	}

	if eth0Body.IP != "" {
		m.Eth0Ip.Default = eth0Body.IP
	} else {
		m.Eth0Ip.Default = "192.168.15.10"
	}
	if eth0Body.NetMask != "" {
		m.Eth0Netmask.Default = eth0Body.NetMask
	} else {
		m.Eth0Netmask.Default = "255.255.255.0"
	}
	if eth0Body.Gateway != "" {
		m.Eth0Gateway.Default = eth0Body.Gateway
	} else {
		m.Eth0Gateway.Default = "192.168.15.1"
	}
	return m
}

func (inst *App) setEth1(connUUID, hostUUID string, eth1Body networking.NetworkInterfaces) Eth1 {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	m := Eth1{}
	eth1IsDHCP, err := client.EdgeDHCPPortExists(hostUUID, &system.NetworkingBody{PortName: constants.Eth1}) // if exists show the user if set to dhcp or static
	if err != nil {
		m.Eth1IpSettingsState.Default = fmt.Sprintf("eth0 err%s", err.Error())
	}
	// eth1
	if eth1IsDHCP != nil {
		if eth1IsDHCP.InterfaceExists {
			if eth1IsDHCP.IsDHCP {
				m.Eth1IpSettingsState.Default = "eth1 is set to dhcp"
			} else {
				m.Eth1IpSettingsState.Default = "eth1 is set to static"
			}
		}
	}
	m.Eth1Interface.ReadOnly = true
	m.Eth1Interface.Default = "eth1"
	if eth1Body.IP != "" {
		m.Eth1Ip.Default = eth1Body.IP
	} else {
		m.Eth1Ip.Default = "192.168.15.10"
	}
	if eth1Body.NetMask != "" {
		m.Eth1Netmask.Default = eth1Body.NetMask
	} else {
		m.Eth1Netmask.Default = "255.255.255.0"
	}
	if eth1Body.Gateway != "" {
		m.Eth1Gateway.Default = eth1Body.Gateway
	} else {
		m.Eth1Gateway.Default = "192.168.15.1"
	}
	return m
}

func (inst *App) GetRcNetworkSchema(connUUID, hostUUID string) interface{} {
	resp, err := inst.buildNetworkSchema(connUUID, hostUUID)
	if err != nil {
		return nil
	}
	return resp
}

func (inst *App) buildNetworkSchema(connUUID, hostUUID string) (interface{}, error) {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})

	deviceInfo, err := client.GetEdgeDeviceInfo(hostUUID)
	if err != nil {
		return false, err
	}
	networks, err := client.EdgeGetNetworks(hostUUID)
	if err != nil {
		return false, err
	}

	deviceType := deviceInfo.DeviceType

	eth0Body := networking.NetworkInterfaces{}
	eth1Body := networking.NetworkInterfaces{}
	for _, network := range networks {
		if network.Interface == constants.Eth0 {
			eth0Body = network
		}
		if network.Interface == constants.Eth1 {
			eth1Body = network
		}
	}
	m := &RcNetwork{}
	if deviceType == constants.RubixCompute.String() || deviceType == constants.RubixCompute5.String() {
		m.Eth0 = inst.setEth0(connUUID, hostUUID, eth0Body)
		m.Eth1 = inst.setEth1(connUUID, hostUUID, eth1Body)
		schema.Set(m)
		return m, nil
	}
	if deviceType == constants.RubixComputeIO.String() {
		m.Eth0 = inst.setEth0(connUUID, hostUUID, eth0Body)
		schema.Set(m)
		return m, nil
	}

	m.Eth0 = inst.setEth0(connUUID, hostUUID, eth0Body)
	schema.Set(m)
	return m, nil

}

func (inst *App) edgeDHCPPortExists(connUUID, hostUUID string, body *system.NetworkingBody) (*system.DHCPPortExists, error) {
	client, err := inst.getAssistClient(&AssistClient{
		ConnUUID: connUUID,
	})
	if err != nil {
		return nil, err
	}
	return client.EdgeDHCPPortExists(hostUUID, body)
}

func (inst *App) EdgeDHCPPortExists(connUUID, hostUUID string, body *system.NetworkingBody) *system.DHCPPortExists {
	exists, err := inst.edgeDHCPPortExists(connUUID, hostUUID, body)
	if err != nil {
		return nil
	}
	return exists
}
