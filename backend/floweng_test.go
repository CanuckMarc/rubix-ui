package backend

import (
	"fmt"
	"testing"
)

func TestApp_NodePallet(t *testing.T) {
	app := MockNewApp()
	c := app.NodePallet("cloud", "rc", "", false)
	fmt.Println(c)
}

func TestApp_GetFlow(t *testing.T) {
	app := MockNewApp()
	c := app.GetFlow("cloud", "rc", false)
	fmt.Println(c)
}
