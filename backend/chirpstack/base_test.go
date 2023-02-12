package chirpstack

import (
	"fmt"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

var ipAddr string = "192.168.15.17"
var uName string = "admin"
var pass string = "Helensburgh2508"
var deviceEUI string = "bd6324d827cc20b3"

func TestChirpClient_Login(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	fmt.Println(err)
	if err != nil {
		return
	}

	apps, err := c.GetApplications()
	fmt.Println(err)
	if err != nil {
		return
	}

	devices, err := c.GetDevices(apps.Result[0].Id)
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(devices)
}

func TestChirpClient_GetDeviceProfiles(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	if err != nil {
		fmt.Println(err)
		return
	}

	resp, err := c.GetDeviceProfiles()
	if err != nil {
		fmt.Println(err)
		return
	}
	pprint.PrintJOSN(resp)
}

func TestChirpClient_GetDevice(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	if err != nil {
		fmt.Println(err)
		return
	}
	resp, err := c.GetDevice(deviceEUI)
	if err != nil {
		fmt.Println(err)
		return
	}
	pprint.PrintJOSN(resp)
}

func TestChirpClient_EditDevice(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	if err != nil {
		fmt.Println(err)
		return
	}
	dev, err := c.GetDevice(deviceEUI)
	if err != nil {
		fmt.Println(err)
		return
	}
	dev.Device.Name = "new name"

	respEdit, err := c.EditDevice(dev.Device.DevEUI, dev)
	if err != nil {
		fmt.Println(err)
		return
	}
	pprint.PrintJOSN(respEdit)
}

func TestChirpClient_AddDevice(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	if err != nil {
		fmt.Println(err)
		return
	}
	dev, err := c.GetDevice(deviceEUI)
	if err != nil {
		fmt.Println(err)
		return
	}
	dev.Device.Name = "new name"
	dev.Device.DevEUI = "ccc693d239c20422"
	pprint.PrintJOSN(dev)

	respEdit, err := c.AddDevice(dev)
	if err != nil {
		fmt.Println(err)
		return
	}
	pprint.PrintJOSN(respEdit)
}

func TestChirpClient_DeleteDevice(t *testing.T) {

	c := New(&Connection{Ip: ipAddr})
	err := c.Login(uName, pass)
	if err != nil {
		fmt.Println(err)
		return
	}
	respEdit, err := c.DeleteDevice(deviceEUI)
	if err != nil {
		fmt.Println(err)
		return
	}
	pprint.PrintJOSN(respEdit)
}
