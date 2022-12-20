package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_EdgeFirewallList(t *testing.T) {
	app := MockNewApp()
	msg := app.EdgeFirewallList("cloud", "rc")
	pprint.Print(msg)
}
