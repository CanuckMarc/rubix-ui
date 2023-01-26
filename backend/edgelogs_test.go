package backend

import (
	"fmt"
	"testing"
)

func TestApp_edgeGetLogs(t *testing.T) {
	app := MockNewApp()

	logs, err := app.edgeGetLogs("cloud", "rc")
	// fmt.Println(logs, err)
	if err != nil {
		return
	}

	for _, log := range logs {
		for _, msg := range log.Message {
			fmt.Println(msg)
		}
	}

}

func TestApp_edgeAddLog(t *testing.T) {
	app := MockNewApp()

	log, err := app.edgeAddLog("cloud", "rc", "mosquitto.service", 10)
	fmt.Println(log, err)
	if err != nil {
		return
	}
}
