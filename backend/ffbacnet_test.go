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
		ServerName: "test",
		DeviceId:   1234,
		Port:       47809,
		Mqtt: assistcli.Mqtt{
			BrokerIp: "localhost",
		},
	}
	app.BACnetWriteConfig("cloud", "rc", bac)
}

func TestApp_BACnetReadConfig(t *testing.T) {
	app := MockNewApp()
	app.BACnetReadConfig("cloud", "rc")
}
