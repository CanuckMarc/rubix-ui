package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_getConnection(t *testing.T) {
	app := MockNewApp()
	c := app.ExportConnection(nil)
	pprint.PrintJOSN(c)

}
