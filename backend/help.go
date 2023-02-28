package backend

import "github.com/NubeIO/rubix-ui/backend/constants"

func pluginDescriptions(pluginName string) string {

	switch pluginName {
	case bacnetMasterPlg:
		return "bacnet master: is used to read and write to bacnet devices on an ethernet network"
	case loraPlg:
		return "LoRa protocol: (use serial port /data/socat/LoRa1) The LoRa plugin allows the Rubix Compute controller to receive data from Nube-iO LoRa Raw sensors (Droplets, and MicroEdge)"
	case modbusPlg:
		return "Modbus protocol: Modbus devices can be connected via RS485 (wired), TCP/IP (networked), or LoRa (wireless via Rubix iO Modules use serial port /data/socat/serialBridge1)"
	case systemPlg:
		return "system plugin: is used for running time schedules, and proxy points (generic non protocol points. For example share points between two or more rubix-computes"
	case rubixIOPlg:
		return "rubixio plugin: used to read/write the io on nube device rubix-compute-io"
	case edge28Plg:
		return "edge28 plugin: used to read/write the io on nube device edge-28"
	case influxDBPlg:
		return "influx db 1: used to read/write the influx database (history plugin is needed to use the influx plugin)"
	case influx2Plg:
		return "influx db 2: used to read/write the influx database (history plugin is needed to use the influx plugin)"
	case postgresPlg:
		return "postgres db: used for edge to cloud histories for points (history plugin is needed to use the postgres plugin)"
	case historyPlg:
		return "history: used for point histories"
	default:
		return ""
	}

}

func appsDescriptions(pluginName string) string {

	switch pluginName {
	case constants.BacnetServerDriver:
		return "an app used for setting up the rubix-compute as a bacnet device, so other bacnet-masters can read and write points from this device"
	case constants.RubixEdgeWires:
		return "a flow based programming tool for writing a program for example to control HVAC equipment"
	case constants.FlowFramework:
		return "is an app for doing the following tasks, histories, schedules and running protocols like bacnet, lora and modbus"
	case constants.Edge28App:
		return "is an app used to read/write the io on nube device edge-28"
	case constants.RubixIOApp:
		return "is an app used to read/write the io on nube device rubix-compute-io"
	case constants.LoRaModbusBrideApp:
		return "is an app used to read/write the io on nube IO-16 via lora, this app is to used with the driver-lora and flow-framework modbus plugin"
	case constants.LoRaSerialApp:
		return "LoRa protocol: (use serial port /data/socat/LoRa1) The LoRa plugin allows the Rubix Compute controller to receive data from Nube-iO LoRa Raw sensors (Droplets, and MicroEdge) and also the IO16 when used as modbus over lora (for IO-16 over lora use /data/socat/serialBridge1)"
	default:
		return ""
	}

}
