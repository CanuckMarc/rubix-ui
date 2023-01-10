package storage

import (
	"time"
)

type Backup struct {
	UUID           string      `json:"uuid"`
	ConnectionUUID string      `json:"connection_uuid"`
	ConnectionName string      `json:"connection_name"`
	UserComment    string      `json:"user_comment"`
	HostUUID       string      `json:"host_uuid"`
	HostName       string      `json:"host_name"`
	BackupInfo     string      `json:"backup_info"`
	Time           time.Time   `json:"time"`
	Timestamp      string      `json:"timestamp"`
	Application    string      `json:"application"`     // RubixWires
	SubApplication string      `json:"sub_application"` // WiresFlow
	Data           interface{} `json:"data,omitempty"`
}

type Log struct {
	UUID     string      `json:"uuid"`
	Time     time.Time   `json:"time"`
	Function string      `json:"function"`
	Type     string      `json:"type"`
	HasData  bool        `json:"has_data"`
	Data     interface{} `json:"data,omitempty"`
}

type RubixConnection struct {
	UUID          string `json:"uuid"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Enable        bool   `json:"enable"`
	IP            string `json:"ip"`
	Port          int    `json:"port"`
	HTTPS         bool   `json:"https"`
	ExternalToken string `json:"external_token"`
}
