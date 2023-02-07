package backend

import (
	"encoding/json"
	"fmt"
	"github.com/NubeIO/lib-schema/schema"
	"github.com/NubeIO/rubix-ui/backend/helpers/json2csv"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/storage/logstore"
	log "github.com/sirupsen/logrus"
	"time"
)

func (inst *App) ExportConnection(uuid []string) error {
	var connections []storage.RubixConnection
	conn, err := inst.DB.SelectAll()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	if len(uuid) == 0 { // export all
		connections = conn
	} else {
		for _, connection := range conn {
			for _, c := range uuid {
				if connection.UUID == c {
					connections = append(connections, connection)
				}
			}
		}
	}
	connectionCount := 0
	for _, connection := range connections {
		log.Infof("found connection to backup: %s", connection.Name)
		connectionCount++
	}

	log.Infof("connection count to backup: %d", connectionCount)

	b, err := json.Marshal(connections)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	headers := []string{"name", "description", "enable", "ip", "port", "https", "external_token", "uuid"}
	path := inst.appStore.GetBackupPath()
	t := time.Now().Format("2006-01-02_15-04-05")
	fullPath := fmt.Sprintf("%s/connections_%s.xlsx", path, t)
	err = json2csv.JsonToExcel(b, fullPath, "Sheet1", headers, true, false)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("connection count to backup: %d", connectionCount))
	}
	return nil
}

type IP struct {
	Type    string `json:"type" default:"string"`
	Title   string `json:"title" default:"host ip address"`
	Default string `json:"default" default:"0.0.0.0"`
}

type ConnectionProperties struct {
	Name          schema.Name        `json:"name"`
	Description   schema.Description `json:"description"`
	Enable        schema.Enable      `json:"enable"`
	IP            IP                 `json:"ip"`
	Port          schema.Port        `json:"port"`
	HTTPS         schema.HTTPS       `json:"https"`
	ExternalToken schema.Token       `json:"external_token"`
}

func GetConnectionProperties() *ConnectionProperties {
	m := &ConnectionProperties{}
	m.Name.Min = 0
	m.Port.Default = 1662
	schema.Set(m)
	return m
}

type ConnectionSchema struct {
	Required   []string              `json:"required"`
	Properties *ConnectionProperties `json:"properties"`
}

func (inst *App) GetConnectionSchema() *ConnectionSchema {
	m := &ConnectionSchema{
		Required:   []string{"ip", "port"},
		Properties: GetConnectionProperties(),
	}
	return m
}

func (inst *App) getConnection(uuid string) (*storage.RubixConnection, error) {
	conn, err := inst.DB.Select(uuid)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func (inst *App) GetConnection(uuid string) *storage.RubixConnection {
	conn, err := inst.DB.Select(uuid)
	if err != nil {
		return nil
	}
	return conn
}

func (inst *App) GetConnections() []storage.RubixConnection {
	conn, err := inst.DB.SelectAll()
	if err != nil {
		return nil
	}
	return conn
}

func (inst *App) AddConnection(conn *storage.RubixConnection) *rumodel.Response {
	conn, err := inst.DB.Add(conn)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	_, _ = inst.forceGetAssistClient(conn.UUID)
	return rumodel.SuccessResponse(conn)
}

func (inst *App) updateConnection(uuid string, conn *storage.RubixConnection) (*storage.RubixConnection, error) {
	conn, err := inst.DB.Update(uuid, conn)
	_, _ = inst.forceGetAssistClient(uuid)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func (inst *App) UpdateConnection(uuid string, conn *storage.RubixConnection) *rumodel.Response {
	resp, err := inst.updateConnection(uuid, conn)
	if err != nil {
		return rumodel.FailResponse(err)
	}
	return rumodel.SuccessResponse(resp)
}

func (inst *App) DeleteConnectionBulk(uuids []UUIDs) interface{} {
	for _, item := range uuids {
		msg, err := inst.deleteConnection(item.UUID)
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("delete network %s %s", item.Name, msg))
		} else {
			inst.uiSuccessMessage(fmt.Sprintf("deleted network: %s", item.Name))
		}
	}
	return "ok"
}

func (inst *App) deleteConnection(uuid string) (string, error) {
	connection, err := inst.DB.Select(uuid)
	if err != nil {
		return "failed to find connection to backup", err
	}
	_, err = inst.DB.AddLog(&storage.Log{
		Function: logstore.Connection.String(),
		Type:     logstore.Delete.String(),
		Data:     connection,
	})
	if err != nil {
		return "", err
	}
	err = inst.DB.Delete(uuid)
	if err != nil {
		return "", err
	}
	return "deleted ok", nil
}

func (inst *App) DeleteConnection(uuid string) string {
	connection, err := inst.DB.Select(uuid)
	if err != nil {
		return "failed to find connection to backup"
	}
	inst.DB.AddLog(&storage.Log{
		Function: logstore.Connection.String(),
		Type:     logstore.Delete.String(),
		Data:     connection,
	})
	err = inst.DB.Delete(uuid)
	if err != nil {
		return err.Error()
	}
	return "deleted ok"
}

type DeleteAllConnections struct {
	CountDeleted int
	Error        string
}

func (inst *App) DeleteAllConnections() *DeleteAllConnections {
	resp := &DeleteAllConnections{}
	count, err := inst.DB.Wipe()
	resp.CountDeleted = count
	if err != nil {
		resp.Error = err.Error()
		return resp
	}
	return resp
}
