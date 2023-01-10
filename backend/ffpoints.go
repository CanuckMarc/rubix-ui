package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/storage/logstore"
	log "github.com/sirupsen/logrus"
)

func (inst *App) GetPointsForDevice(connUUID, hostUUID, deviceUUID string) []*model.Point {
	device, err := inst.getDevice(connUUID, hostUUID, deviceUUID, true)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return device.Points
}

func (inst *App) GetPoints(connUUID, hostUUID string) []model.Point {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	points, err := client.GetPoints(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return points
}

func (inst *App) WritePointValue(connUUID, hostUUID, pointUUID string, value *model.Priority) *model.Point {
	pointValue, err := inst.writePointValue(connUUID, hostUUID, pointUUID, value)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return pointValue
}

func (inst *App) writePointValue(connUUID, hostUUID, pointUUID string, body *model.Priority) (*model.Point, error) {
	pprint.PrintJOSN(body)
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil, err
	}
	pnt, err := client.WritePointValue(hostUUID, pointUUID, body)
	if err != nil {
		return nil, err
	}
	return pnt, nil
}

func (inst *App) addPoint(connUUID, hostUUID string, body *model.Point) (*model.Point, error) {
	if body.Name == "" {
		body.Name = fmt.Sprintf("point-%s", uuid.ShortUUID("")[5:10])
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	point, err := client.AddPoint(hostUUID, body)
	if err != nil {
		return nil, err
	}
	return point, nil
}

func (inst *App) AddPointsBulk(connUUID, hostUUID string, body []model.Point) {
	var addedCount int
	var errorCount int
	for _, pnt := range body {
		_, err := inst.addPoint(connUUID, hostUUID, &pnt)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("added count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to add count: %d", errorCount))
	}

}

func (inst *App) AddPoint(connUUID, hostUUID string, body *model.Point) *model.Point {
	point, err := inst.addPoint(connUUID, hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return point
}

func (inst *App) EditPoint(connUUID, hostUUID, pointUUID string, body *model.Point) *model.Point {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	points, err := client.EditPoint(hostUUID, pointUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return points
}

func (inst *App) DeletePointBulk(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, pnt := range uuids {
		_, err := client.DeletePoint(hostUUID, pnt.UUID)
		if err != nil {
			errorCount++
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		} else {
			addedCount++
		}
	}
	if addedCount > 0 {
		inst.uiSuccessMessage(fmt.Sprintf("delete count: %d", addedCount))
	}
	if errorCount > 0 {
		inst.uiErrorMessage(fmt.Sprintf("failed to delete count: %d", errorCount))
	}
	return nil

}

func (inst *App) DeletePoint(connUUID, hostUUID, pointUUID string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeletePoint(hostUUID, pointUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) GetPointPriority(connUUID, hostUUID, pointUUID string) *model.Point {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	points, err := client.GetPointPriority(hostUUID, pointUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return points
}

func (inst *App) GetPoint(connUUID, hostUUID, pointUUID string) *model.Point {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	points, err := client.GetPoint(hostUUID, pointUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return points
}

type BulkAddResponse struct {
	Message    string `json:"message"`
	AddedCount int    `json:"added_count"`
	ErrorCount int    `json:"error_count"`
}

func (inst *App) ImportPointBulk(connUUID, hostUUID, backupUUID, deviceUUID string) *BulkAddResponse {
	resp, err := inst.importPointBulk(connUUID, hostUUID, backupUUID, deviceUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) importPointBulk(connUUID, hostUUID, backupUUID, deviceUUID string) (*BulkAddResponse, error) {
	if deviceUUID == "" {
		return nil, errors.New("device uuid cant not be empty")
	}
	backup, err := inst.getBackup(backupUUID)
	if err != nil {
		return nil, err
	}
	application := fmt.Sprintf("%s", logstore.FlowFramework)
	subApplication := fmt.Sprintf("%s", logstore.FlowFrameworkPoint)
	if backup.Application != application {
		return nil, errors.New(fmt.Sprintf("no match for application: %s", application))
	}
	if backup.SubApplication != subApplication {
		return nil, errors.New(fmt.Sprintf("no match for subApplication: %s", subApplication))
	}
	b, err := json.Marshal(backup.Data)
	var points []model.Point
	if err := json.Unmarshal(b, &points); err != nil {
		return nil, errors.New("failed to parse points from backup")
	}
	var message string
	var addedCount int
	var errorCount int
	for _, point := range points {
		point.DeviceUUID = deviceUUID
		newPnt, err := inst.addPoint(connUUID, hostUUID, &point)
		if err != nil {
			log.Errorf(fmt.Sprintf("add point err: %s", err.Error()))
			message = fmt.Sprintf("last error on add point err: %s", err.Error())
			errorCount++
		} else {
			log.Infof(fmt.Sprintf("add point: %s", newPnt.Name))
			addedCount++
		}
	}
	return &BulkAddResponse{
		Message:    message,
		AddedCount: addedCount,
		ErrorCount: errorCount,
	}, err
}

func (inst *App) ExportPointBulk(connUUID, hostUUID, userComment, deviceUUID string, pointUUIDs []string) *storage.Backup {
	resp, err := inst.exportPointBulk(connUUID, hostUUID, userComment, deviceUUID, pointUUIDs)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) exportPointBulk(connUUID, hostUUID, userComment, deviceUUID string, pointUUIDs []string) (*storage.Backup, error) {
	var pointsList []model.Point
	var count int
	device, err := inst.getDevice(connUUID, hostUUID, deviceUUID, true)
	if err != nil {
		return nil, err
	}
	for _, uuid := range pointUUIDs {
		for _, point := range device.Points {
			if point.UUID == uuid {
				pointsList = append(pointsList, *point)
			}
			count++
		}
	}
	back := &storage.Backup{}
	back.ConnectionUUID = connUUID
	back.HostUUID = hostUUID
	back.Application = fmt.Sprintf("%s", logstore.FlowFramework)
	back.SubApplication = fmt.Sprintf("%s", logstore.FlowFrameworkPoint)
	back.UserComment = userComment
	back.Data = pointsList
	backup, err := inst.addBackup(back)
	if err != nil {
		return nil, err
	}
	return backup, nil
}
