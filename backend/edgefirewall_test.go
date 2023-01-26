package backend

import (
	"testing"

	"github.com/NubeIO/rubix-edge/service/system"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
)

func TestApp_EdgeFirewallList(t *testing.T) {
	app := MockNewApp()
	msg := app.EdgeFirewallList("cloud", "rc")
	pprint.Print(msg)
}

func TestApp_EdgeEdgeFirewallStatus(t *testing.T) {
	app := MockNewApp()
	msg := app.EdgeFirewallStatus("cloud", "rc")
	pprint.Print(msg)
}

func TestApp_EdgeFirewallEnable(t *testing.T) {
	app := MockNewApp()
	msg := app.EdgeFirewallEnable("cloud", "rc")
	pprint.Print(msg)
}

func TestApp_EdgeFirewallDisable(t *testing.T) {
	app := MockNewApp()
	msg := app.EdgeFirewallDisable("cloud", "rc")
	pprint.Print(msg)
}

func TestApp_EdgeFirewallOpen(t *testing.T) {
	app := MockNewApp()
	body := system.UFWBody{
		Port: 1111,
	}
	msg := app.EdgeFirewallPortOpen("cloud", "rc", body)
	pprint.Print(msg)
}

func TestApp_EdgeFirewallClose(t *testing.T) {
	app := MockNewApp()
	body := system.UFWBody{
		Port: 13579,
	}

	msg_0 := app.EdgeFirewallList("cloud", "rc")
	pprint.Print(msg_0)

	msg_1 := app.EdgeFirewallPortClose("cloud", "rc", body)
	pprint.Print(msg_1)

	msg_2 := app.EdgeFirewallList("cloud", "rc")
	pprint.Print(msg_2)
}
