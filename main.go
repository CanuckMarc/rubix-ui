package main

import (
	"embed"
	"github.com/NubeIO/rubix-ui/backend"
	log "github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	var err error
	app := backend.NewApp()
	AppMenu := menu.NewMenu()
	err = app.GitDownloadAllReleases()
	if err != nil {
		log.Errorln(err)
	}

	FileMenu := AppMenu.AddSubmenu("Options")
	FileMenu.AddSeparator()
	FileMenu.AddText("Reload", keys.Key("f5"), func(_ *menu.CallbackData) {
		app.OnReload()
	})
	FileMenu.AddText("Help", keys.CmdOrCtrl("h"), func(_ *menu.CallbackData) {
		app.NubeHelp()
	})
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		app.OnQuit()
	})
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
