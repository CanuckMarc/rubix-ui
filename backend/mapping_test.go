package backend

import (
	"testing"

	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
)

func TestApp_GetNodesAllFlowNetworks(t *testing.T) {
	app := MockNewApp()
	f := app.GetNodesAllFlowNetworks("cloud", "rc", true)
	pprint.PrintJOSN(f)
}

func TestApp_GetBacnetNodes(t *testing.T) {
	app := MockNewApp()
	f := app.GetBacnetNodes("cloud", "rc", true)
	pprint.PrintJOSN(f)
}

func TestApp_getBacnetFreeAddress(t *testing.T) {
	app := MockNewApp()
	f := app.GetBacnetFreeAddress("cloud", "rc", true)
	pprint.PrintJOSN(f)
}
