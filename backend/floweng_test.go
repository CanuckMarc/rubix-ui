package backend

import (
	"fmt"
	"testing"
)

func TestApp_NodePallet(t *testing.T) {
	app := MockNewApp()
	// 1111 con_0deb1ef16240 hos_f9f6bf2a69c8 true
	c := app.NodePallet("cloud", "rc", "", false)
	fmt.Println(c)
}
