package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_GetFlowNetworkSchema(t *testing.T) {
	app := MockNewApp()
	resp := app.GetFlowNetworkSchema("cloud", "rc", "modbus")
	pprint.PrintJOSN(resp)
}
