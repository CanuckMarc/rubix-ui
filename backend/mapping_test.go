package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_GetNodesAllFlowNetworks(t *testing.T) {
	app := MockNewApp()
	f := app.GetNodesAllFlowNetworks("cloud", "rc", true)
	pprint.PrintJOSN(f)
}
