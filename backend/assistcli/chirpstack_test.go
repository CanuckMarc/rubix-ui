package assistcli

import (
	"fmt"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

var uName string = "admin"
var pass string = "Helensburgh2508"
var deviceEUI string = "9ce3cb7d914a5ef5"

func TestClient_CSLogin(t *testing.T) {
	token, err := client.CSLogin("rc", uName, pass)
	fmt.Println(err)
	fmt.Println(token)

	resp, err := client.CSGetApplications("rc", token)
	fmt.Println(err)
	pprint.PrintJOSN(resp)

}
