package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-edge/service/system"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_edgeDHCPPortExists(t *testing.T) {
	app := MockNewApp()
	schema, err := app.edgeDHCPPortExists("cloud", "rc", &system.NetworkingBody{
		PortName: "eth0",
	})
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(schema)
}

func TestApp_buildNetworkSchema(t *testing.T) {
	app := MockNewApp()
	schema, err := app.buildNetworkSchema("cloud", "rc")
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(schema)
}

func TestApp_EditIP(t *testing.T) {
	app := MockNewApp()
	// netType := dhcpDynamic
	netType := staticFixed

	app.RcSetNetworks("cloud", "rc", &RcNetworkBody{
		Eth0IpSettings: netType,
		Eth0Interface:  "eth0",
		Eth0Ip:         "192.168.15.11",
		Eth0Netmask:    "255.255.255.0",
		Eth0Gateway:    "192.168.15.1",
		Eth1IpSettings: "",
		Eth1Interface:  "",
		Eth1Ip:         "",
		Eth1Netmask:    "",
		Eth1Gateway:    "",
	})

}
