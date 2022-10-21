package backend

import (
	"fmt"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_edgeProductInfo(t *testing.T) {
	app := MockNewApp()
	store, err := app.edgeProductInfo(connection, "rc")
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(store)
}

func TestApp_EdgeGetNetworks(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeGetNetworks("cloud", "rc")
	pprint.PrintJOSN(resp)
}
