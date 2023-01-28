package backend

import (
	"fmt"
	"github.com/NubeIO/git/pkg/git"
	"github.com/NubeIO/rubix-ui/backend/constants"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

var connection = "cloud"
var token = "Z2hwX3pIdklCZFZPWmd5N1M2YXFtcHBWMHRkcndIbUk5eTNEMnlQMg=="
var releaseVersion = "v0.6.6"
var appName = constants.RubixWires
var appVersion = "v2.7.4"
var arch = "amd64"

func TestApp_addRelease(t *testing.T) { // downloads from GitHub and stores in local json DB
	token := git.DecodeToken(token)
	fmt.Printf("token: %s\n", token)
	path := "flow/v0.6.8.json"
	app := MockNewApp()
	release, err := app.addRelease(token, path)
	if err != nil {
		fmt.Printf("error: %s\n", err)
		return
	}
	pprint.PrintJOSN(release)
}

func TestApp_StoreDownloadApp(t *testing.T) { // will save all apps from the version
	token := git.DecodeToken(token)
	fmt.Printf("token: %s\n", token)
	app := MockNewApp()
	downloaded := app.storeDownloadApp(token, "v0.6.8", constants.FlowFramework, "v0.6.6", "amd64")
	pprint.PrintJOSN(downloaded)
}

func TestApp_getLatestReleaseVersion(t *testing.T) {
	release, err := MockNewApp().getLatestReleaseVersion()
	fmt.Println(release)
	fmt.Println(err)
	if err != nil {
		fmt.Printf("error: %s\n", err)
	}
}

func TestApp_GitDownloadReleases(t *testing.T) { // downloads from GitHub and stores in local json DB
	app := MockNewApp()
	_ = app.GitDownloadReleases()
}

func TestApp_GetReleases(t *testing.T) { // downloads from GitHub and stores in local json DB
	app := MockNewApp()
	resp, err := app.DB.GetReleases()
	for _, release := range resp {
		pprint.Print(release)
	}
	if err != nil {
		fmt.Printf("error: %s\n", err)
	}
}
