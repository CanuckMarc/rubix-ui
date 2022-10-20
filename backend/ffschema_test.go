package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_GetFlowNetworkSchema(t *testing.T) {
	app := NewApp()

	resp := app.GetFlowNetworkSchema("cloud", "rc", "modbus")
	pprint.PrintJOSN(resp)
}

func TestApp_GetLocationTableSchema(t *testing.T) {
	app := NewApp()

	resp := app.GetLocationTableSchema("cloud")
	pprint.PrintJOSN(resp)

}
