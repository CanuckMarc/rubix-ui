package assistcli

import (
	"fmt"
	pprint "github.com/NubeIO/rubix-assist/pkg/helpers/print"
	"testing"
)

func TestClient_AddFlowNetwork(t *testing.T) {
	cli := New(&Client{
		Rest:  nil,
		Ip:    "",
		Port:  0,
		HTTPS: false,
	})
	network, err := cli.GetStreamsByFlowNetwork("rc", "fln_cd7d562b1fa04c1e")
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJSON(network)
}
