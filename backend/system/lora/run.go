package lora

import (
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/system/lora/decoder"
	log "github.com/sirupsen/logrus"
	"time"
)

func New(opts *Instance) *Instance {
	return opts
}

// Run LoRa plugin loop
func (inst *Instance) Run() {
	defer inst.serialClose()

	for {
		sc, err := inst.serialOpen("/dev/ttyUSB0", 38400)
		if err != nil {
			log.Error("loraraw: error opening serial ", err)
			time.Sleep(5 * time.Second)
			continue
		}
		serialPayloadChan := make(chan string, 1)
		serialCloseChan := make(chan error, 1)
		go sc.loop(serialPayloadChan, serialCloseChan)

	readLoop:
		for {
			select {
			case <-inst.interruptChan:
				log.Info("loraraw: interrupt received on run")
				return
			case err := <-serialCloseChan:
				log.Error("loraraw: serial connection error: ", err)
				log.Info("loraraw: serial connection attempting to reconnect...")
				break readLoop
			case data := <-serialPayloadChan:
				inst.handleSerialPayload(data)
			}
		}
	}
}

func (inst *Instance) handleSerialPayload(data string) {
	fmt.Println(data)
	if !decoder.ValidPayload(data) {
		return
	}

	id := decoder.DecodeAddress(data) // show user messages from lora
	rssi := decoder.DecodeRSSI(data)
	log.Infof("lora-raw: message from sensor id: %s rssi: %d", id, rssi)
	return

}
