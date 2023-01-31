package assistcli

import (
	"fmt"
	"testing"
	"time"
)

func TestHostLocation(*testing.T) {
	hosts := client.GetHostSchema()
	fmt.Println(hosts)
	uuid := ""
	fmt.Println(hosts)
	host, res := client.GetLocation(uuid)
	fmt.Println(res.StatusCode)
	if res.StatusCode != 200 {
	}
	fmt.Println(host)
	host.Name = fmt.Sprintf("name_%d", time.Now().Unix())
	host, _ = client.AddLocation(host)
	host.Name = "get " + fmt.Sprintf("name_%d", time.Now().Unix())

	fmt.Println("NEW host", host.Name)
	host, _ = client.UpdateLocation(host.UUID, host)
}
