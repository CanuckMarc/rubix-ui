package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/installer"
	"testing"
)

func TestApp_storeGetPluginPath(t *testing.T) {
	app := MockNewApp()
	body := &installer.Plugin{
		Name:    "bacnetserver",
		Arch:    "amd64",
		Version: "v0.6.6",
	}
	path, _, err := app.storeGetPluginPath(body)
	fmt.Println(path)
	fmt.Println(err)
}
