package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_GetProducer(t *testing.T) {
	app := MockNewApp()
	resp := app.GetProducers("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_GetProducerByThingUUID(t *testing.T) {
	app := MockNewApp()
	resp := app.GetProducerByThingUUID("cloud", "rc", "pnt_dfc0d82cc4a24fc7")
	pprint.PrintJOSN(resp)
}

func TestApp_EditProducerHistory(t *testing.T) {
	app := MockNewApp()
	resp := app.EditProducerHistory("cloud", "rc", "pnt_dfc0d82cc4a24fc7", "CO", true, 1)
	pprint.PrintJOSN(resp)
}
