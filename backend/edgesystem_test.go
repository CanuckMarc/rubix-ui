package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func Test_EdgeSystem(t *testing.T) {
	app := MockNewApp()
	resp, err := app.edgeSystemCtlAction("cloud", "rc", "rubix-edge-wires", amodel.Restart)
	fmt.Println(err)
	pprint.PrintJOSN(resp)
}
