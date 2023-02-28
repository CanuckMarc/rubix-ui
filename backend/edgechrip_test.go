package backend

import (
	"fmt"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_CSGetApplications(t *testing.T) {
	app := MockNewApp()
	resp := app.CSGetApplications("cloud", "rc")
	fmt.Println(resp)
}

func TestApp_CSGetGateway(t *testing.T) {
	app := MockNewApp()
	resp := app.CSGetGateway("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_CSGetDevices(t *testing.T) {
	app := MockNewApp()
	resp := app.CSGetDevices("cloud", "rc", "")
	pprint.PrintJOSN(resp)
}

func TestApp_CSDeleteDevice(t *testing.T) {
	app := MockNewApp()
	resp := app.CSDeleteDevice("cloud", "rc", "1f0366bc6c4939d3")
	fmt.Println(resp)
}

func TestApp_CSGetDeviceProfiles(t *testing.T) {
	app := MockNewApp()
	resp := app.CSGetDeviceProfiles("cloud", "rc")
	fmt.Println(resp)
}

func TestApp_CSDeviceOTAKeys(t *testing.T) {
	app := MockNewApp()
	resp := app.CSDeviceOTAKeys("cloud", "rc", "a81758fffe0590b7", "dd9b7b5e23f351ee4fb3ed610afa45dc")
	fmt.Println(resp)
}
