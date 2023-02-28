package backend

import (
	"github.com/NubeIO/rubix-ui/backend/constants"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_EdgeFileExists(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeFileExists("cloud", "rc", "/data/rubix-edge-wires/data/data.db")
	pprint.PrintJOSN(resp)
}
func TestApp_EdgeDeleteAppDB(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeDeleteAppDB("cloud", "rc", constants.RubixEdgeWires)
	pprint.PrintJOSN(resp)
}
