package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"testing"
)

func TestApp_bacnetWhois(t *testing.T) {
	app := MockNewApp()
	whois, err := app.bacnetWhois("cloud", "rc", "net_5110e7411c1e4695", bacnetMasterPlg)
	fmt.Println(err)
	fmt.Println(whois)
	if err != nil {
		return
	}
}

func TestApp_BACnetWriteConfig(t *testing.T) {
	app := MockNewApp()
	bac := assistcli.ConfigBACnetServer{
		ServerName: "dev-1234",
		DeviceId:   1234,
		Port:       47808,
		Iface:      "eth0",
		BiMax:      0,
		BoMax:      0,
		BvMax:      60,
		AiMax:      32,
		AoMax:      32,
		AvMax:      60,
		Mqtt: assistcli.Mqtt{
			BrokerIp:          "127.0.0.1",
			BrokerPort:        1883,
			Debug:             true,
			Enable:            true,
			WriteViaSubscribe: true,
			RetryEnable:       true,
			RetryLimit:        5,
			RetryInterval:     5,
		},
	}
	app.BACnetWriteConfig("cloud", "rc", bac)
}

func TestApp_BACnetReadConfig(t *testing.T) {
	app := MockNewApp()
	c := app.BACnetReadConfig("cloud", "rc")
	fmt.Println(c)
}
