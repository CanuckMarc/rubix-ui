package backend

import (
	"fmt"
	"testing"
)

func TestApp_GetHostTime(t *testing.T) {
	app := MockNewApp()
	app.GetHostTime("cloud", "rc")
}

func TestApp_EdgeGetHardwareTZ(t *testing.T) {
	app := MockNewApp()
	list := app.EdgeGetHardwareTZ("cloud", "rc")
	fmt.Println(list)
}

func TestApp_EdgeGetTimeZoneList(t *testing.T) {
	app := MockNewApp()
	list := app.EdgeGetTimeZoneList("cloud", "rc")
	fmt.Println(list)
}

func TestApp_EdgeUpdateTimezone(t *testing.T) {
	app := MockNewApp()
	app.EdgeUpdateTimezone("cloud", "rc", "Africa/Cairo")
}

func TestApp_EdgeUpdateSystemTime(t *testing.T) {
	app := MockNewApp()
	resp := app.EdgeUpdateSystemTime("cloud", "rc", "2006-01-02 15:04:05")
	fmt.Println(resp)
}
