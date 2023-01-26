package main

import (
	"embed"
	"github.com/NubeIO/lib-files/fileutils"
	"github.com/NubeIO/rubix-ui/backend"
	"github.com/NubeIO/rubix-ui/backend/system/lora"
	log "github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"os"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	var err error
	homeDir, err := fileutils.HomeDir()
	if err != nil {
		log.Errorf("error on finding home dir %s", err.Error())
	}
	log.Infof("user home dir %s", homeDir)
	workingDir, err := os.Getwd()
	if err != nil {
		log.Errorf("error on finding home dir %s", err.Error())
	}
	log.Infof("user app working dir %s", workingDir)

	app := backend.NewApp()
	AppMenu := menu.NewMenu()
	var enableSerial bool
	if enableSerial {
		loraStreaming := lora.New(&lora.Instance{})
		go loraStreaming.Run()
	}

	FileMenu := AppMenu.AddSubmenu("Options")
	FileMenu.AddSeparator()
	FileMenu.AddText("Reload", keys.Key("f5"), func(_ *menu.CallbackData) {
		app.OnReload()
	})
	FileMenu.AddText("New Tab", keys.CmdOrCtrl("t"), func(_ *menu.CallbackData) {
		app.NewTab(workingDir)
	})
	FileMenu.AddText("Help", keys.CmdOrCtrl("h"), func(_ *menu.CallbackData) {
		app.NubeHelp()
	})
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		app.OnQuit()
	})
	// go cmd.Execute()
	err = wails.Run(&options.App{
		Title:  "rubix",
		Width:  1300,
		Height: 750,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		StartHidden: false,
		Menu:        AppMenu,
		OnStartup:   app.OnStartup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		log.Errorln("Start Error:", err)
	}
}
