package assistcli

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-auth-go/user"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/nils"
	"testing"
)

func TestClient_FFLogin(t *testing.T) {
	cli := New(&Client{
		Rest:  nil,
		Ip:    "0.0.0.0",
		Port:  0,
		HTTPS: false,
	})
	login, err := cli.FFLogin("rc", &user.User{
		Username: "admin",
		Password: "N00BWires",
	})
	fmt.Println(err)
	fmt.Println(login)
	if err != nil {
		return
	}
	// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjQ0MjA2MjMsImlhdCI6MTY2MTgyODYyMywic3ViIjoiYWRtaW4ifQ.6UY_BPw-7m_gJVys_Toj6vyJw-XvoomqfJ-gIRvm8wA
}

func TestClient_FFGenerateToken(t *testing.T) {
	cli := New(&Client{
		Rest:  nil,
		Ip:    "",
		Port:  0,
		HTTPS: false,
	})
	jwt := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjQ0MjE1MTIsImlhdCI6MTY2MTgyOTUxMiwic3ViIjoiYWRtaW4ifQ.rgJ_300heVLG7dEHM3NwzQzrziIJ6tEVXqJ-bSFxvHw"
	login, err := cli.FFGenerateToken("rc", jwt, &TokenCreate{Name: "test2", Blocked: nils.NewFalse()})
	fmt.Println(err)
	fmt.Println(login)
	if err != nil {
		return
	}
}
