package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/flowcli"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_NodePallet(t *testing.T) {
	app := MockNewApp()
	c := app.NodePallet("cloud", "rc", "", false)
	fmt.Println(c)
}

func TestApp_GetFlow(t *testing.T) {
	app := MockNewApp()
	c := app.GetFlow("cloud", "rc", true)
	pprint.PrintJOSN(c)
}

func TestApp_GetFlowList(t *testing.T) {
	app := MockNewApp()
	nodeIds := &flowcli.NodesList{}
	nodeIds.Nodes = []string{"6C63373BA0CB4CF498EF6F03861685B4"}
	c := app.GetFlowList("cloud", "rc", nodeIds, false)
	pprint.PrintJOSN(c)
}

func TestApp_GetFlowByNodeType(t *testing.T) {
	app := MockNewApp()
	c := app.GetFlowByNodeType("cloud", "rc", "bacnet/bacnet-server", true)
	pprint.PrintJOSN(c)
}

func TestApp_GetSubFlow(t *testing.T) {
	app := MockNewApp()
	c := app.GetSubFlow("cloud", "rc", "7F6C5EE2015F44B3BBCC6568F9F061F3", true)
	pprint.PrintJOSN(c)
}
