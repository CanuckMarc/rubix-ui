package store

import (
	"fmt"
	"github.com/NubeIO/git/pkg/git"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestAppStore_ListReleases(t *testing.T) {
	appStore, _ := New(&Store{})
	opts := &git.AssetOptions{
		Owner: "NubeIO",
		Repo:  "rubix-io-fw",
		Tag:   "latest",
		Arch:  "",
	}
	pageOpts := &git.ListOptions{
		Page:    0,
		PerPage: 0,
	}
	token := git.DecodeToken(token)
	resp, err := appStore.ListReleases(opts, token, pageOpts)
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(resp)

}

func TestApp_DownloadFirmware(t *testing.T) { // downloads from GitHub and stores in local json DB
	appStore, err := New(&Store{})

	token := git.DecodeToken(token)
	fmt.Printf("token: %s\n", token)
	asset, err := appStore.DownloadIO16Firmware(token, "v3.2")
	if err != nil {
		fmt.Printf("error: %s\n", err)
		return
	}
	fmt.Println(asset)
}

func TestAppStore_ListIO16(t *testing.T) {
	appStore, _ := New(&Store{})
	io16, err := appStore.ListIO16Builds()
	if err != nil {
		return
	}
	fmt.Println(io16, err)
}
func TestAppStore_ListIO16BuildFiles(t *testing.T) {
	appStore, _ := New(&Store{})
	io16, err := appStore.ListIO16BuildFiles("R-IO-Modbus-v3.2", false)
	if err != nil {
		return
	}
	fmt.Println(io16, err)
}
