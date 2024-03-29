package lora

import (
	"bufio"
	log "github.com/sirupsen/logrus"
	"go.bug.st/serial"
)

// Instance is plugin instance
type Instance struct {
	enabled       bool
	basePath      string
	pluginUUID    string
	networkUUID   string
	interruptChan chan struct{}
}

type SerialSetting struct {
	SerialPort     string
	Enable         bool
	BaudRate       int
	StopBits       serial.StopBits
	Parity         serial.Parity
	DataBits       int
	Timeout        int
	ActivePortList []string
	Connected      bool
	Error          bool
	I              Instance
}

var Port serial.Port

func (inst *Instance) serialOpen(serialPort string, serialBaudRate int) (SerialSetting, error) {
	s := SerialSetting{
		SerialPort: serialPort,
		BaudRate:   serialBaudRate,
	}
	_, err := s.open()
	return s, err
}

func (inst *Instance) serialClose() error {
	return disconnect()
}

func (s *SerialSetting) loop(plChan chan<- string, errChan chan<- error) {
	scanner := bufio.NewScanner(Port)
	for scanner.Scan() {
		plChan <- scanner.Text()
	}
	errChan <- scanner.Err()
}

func (s *SerialSetting) open() (connected bool, err error) {
	portName := s.SerialPort
	baudRate := s.BaudRate
	parity := s.Parity
	stopBits := s.StopBits
	dataBits := s.DataBits
	if s.Connected {
		log.Info("Existing serial port connection by this app is open So! close existing connection")
		err := disconnect()
		if err != nil {
			log.Info(err)
			s.Error = true
			return false, err
		}
	}
	log.Info("lora-serial: connecting to port: ", portName)
	m := &serial.Mode{
		BaudRate: baudRate,
		Parity:   parity,
		DataBits: dataBits,
		StopBits: stopBits,
	}

	ports, _ := serial.GetPortsList()
	s.ActivePortList = ports

	port, err := serial.Open(portName, m)
	if err != nil {
		s.Error = true
		return false, err
	}
	Port = port
	s.Connected = true
	log.Info("lora-serial: Connected to serial port: ", " ", portName, " ", "connected: ", " ", s.Connected)
	return s.Connected, nil
}

func disconnect() error {
	if Port != nil {
		err := Port.Close()
		if err != nil {
			log.Error("lora-serial: err on trying to close the port")
			return err
		}
	}
	return nil
}
