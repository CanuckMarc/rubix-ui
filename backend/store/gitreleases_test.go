package store

import (
	"fmt"
	"github.com/NubeIO/git/pkg/git"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

const token = "Z2hwX3pIdklCZFZPWmd5N1M2YXFtcHBWMHRkcndIbUk5eTNEMnlQMg=="

func TestApp_ListReleases(t *testing.T) { // downloads from GitHub and stores in local json DB
	appStore, err := New(&Store{})
	// tok := git.EncodeToken("11")
	token := git.DecodeToken(token)
	fmt.Printf("token: %s\n", token)
	release, err := appStore.GitListReleases(token)
	if err != nil {
		fmt.Printf("error: %s\n", err)
		return
	}
	pprint.PrintJOSN(release)
}

func TestApp_GitDownloadRelease(t *testing.T) { // downloads from GitHub and stores in local json DB
	appStore, err := New(&Store{})
	// tok := git.EncodeToken("11")
	token := git.DecodeToken(token)
	fmt.Printf("token: %s\n", token)
	release, err := appStore.GitDownloadRelease(token, "flow/v0.9.30.json")
	if err != nil {
		fmt.Printf("error: %s\n", err)
		return
	}
	pprint.PrintJOSN(release)
}
