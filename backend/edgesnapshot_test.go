package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_EdgeGetSnapshots(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeGetSnapshots("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeGetSnapshotsCreateLogs(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeGetSnapshotsCreateLogs("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeCreateSnapshot(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeCreateSnapshot("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeRestoreSnapshot(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeRestoreSnapshot("cloud", "rc", "client_name-site_name-device_name_20230215T194300.zip")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeGetSnapshotsRestoreLogs(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeGetSnapshotsRestoreLogs("cloud", "rc")
	pprint.PrintJOSN(resp)
}

func TestApp_EdgeDeleteSnapshot(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeDeleteSnapshot("cloud", "rc", "client_name-site_name-device_name_20230215T192753.zip")
	pprint.PrintJOSN(resp)
}
