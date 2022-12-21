package backend

import (
	"github.com/NubeIO/rubix-ui/backend/constants"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_EdgeAppsInfo(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeAppsInfo(connection, "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeInstallAppFlow(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeInstallApp(connection, "rc", constants.FlowFramework, releaseVersion)
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeInstallApp(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeInstallApp(connection, "rc", appName, appVersion)
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeInstallAppBacnet(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeInstallApp(connection, "rc", constants.BacnetServerDriver, "v0.0.16")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeUnInstallApp(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeUnInstallApp(connection, "rc", appName)
	pprint.PrintJOSN(resp)
}
