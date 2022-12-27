package backend

import (
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_GetSchedules(t *testing.T) {
	app := MockNewApp()
	bulk := app.GetSchedules("cloud", "rc")

	pprint.PrintJOSN(bulk)
}

func TestApp_GetSchedule(t *testing.T) {
	app := MockNewApp()
	bulk := app.GetSchedule("cloud", "rc", "sch_9b573f4405704b9f")

	pprint.PrintJOSN(bulk)
}
