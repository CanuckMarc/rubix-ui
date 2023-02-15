package backend

import (
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	"github.com/NubeIO/rubix-ui/backend/helpers/boolean"
	"github.com/NubeIO/rubix-ui/backend/helpers/integer"
)

func (inst *App) AddProducer(connUUID, hostUUID string, body *model.Producer) *model.Producer {
	if body.ProducerThingUUID == "" {
		inst.uiErrorMessage(fmt.Sprintf("producer uuid can not be empty"))
		return nil
	}
	if body.Name == "" {
		body.Name = fmt.Sprintf("producer-%s", uuid.ShortUUID("")[5:10])
	}
	if body.ProducerThingType == "" {
		body.ProducerThingType = "point"
	}
	if body.ProducerApplication == "" {
		body.ProducerApplication = "mapping"
	}
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	producers, err := client.AddProducer(hostUUID, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return producers
}

func (inst *App) GetProducers(connUUID, hostUUID string) []model.Producer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return []model.Producer{}
	}
	resp, err := client.GetProducers(hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) getProducer(connUUID, hostUUID, uuid string, withWriterClones bool) (*model.Producer, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil, err
	}
	producers, err := client.GetProducer(hostUUID, uuid, withWriterClones)
	if err != nil {
		return nil, err
	}
	return producers, nil
}

func (inst *App) GetProducer(connUUID, hostUUID, uuid string, withWriterClones bool) *model.Producer {
	producers, err := inst.getProducer(connUUID, hostUUID, uuid, withWriterClones)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return producers
}

func (inst *App) GetProducerByThingUUID(connUUID, hostUUID, thingUUID string) *model.Producer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	producers, err := client.GetProducerByThingUUID(hostUUID, thingUUID)
	if err != nil {
		return nil
	}
	return producers
}

const (
	historyTypeCov            string = "COV"
	historyTypeInterval       string = "INTERVAL"
	historyTypeCovAndInterval string = "COV_AND_INTERVAL"
)

func (inst *App) EditProducerHistory(connUUID, hostUUID, pointUUID, historyType string, historyEnable bool, interval int) *model.Producer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	producer, err := client.GetProducerByThingUUID(hostUUID, pointUUID)
	if err != nil || producer == nil {
		if err != nil {
			inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
			return nil
		}
		return nil
	}
	var correctType bool
	if historyType == historyTypeCov {
		correctType = true
	}
	if historyType == historyTypeInterval {
		correctType = true
	}
	if historyType == historyTypeCovAndInterval {
		correctType = true
	}
	if !correctType {
		inst.uiErrorMessage("invalid history type was selected")
		return nil
	}
	producer.HistoryType = model.HistoryType(historyType)
	producer.EnableHistory = boolean.New(historyEnable)
	producer.HistoryInterval = integer.New(interval)

	producers, err := client.EditProducer(hostUUID, producer.UUID, producer)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return producers
}

func (inst *App) EditProducer(connUUID, hostUUID, uuid string, body *model.Producer) *model.Producer {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	producers, err := client.EditProducer(hostUUID, uuid, body)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return producers
}

func (inst *App) DeleteProducer(connUUID, hostUUID, uuid string) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	_, err = client.DeleteProducer(hostUUID, uuid)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return "delete ok"
}

func (inst *App) DeleteProducerBulk(connUUID, hostUUID string, uuids []UUIDs) interface{} {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	err = inst.errMsg(err)
	if err != nil {
		return nil
	}
	var addedCount int
	var errorCount int
	for _, item := range uuids {
		_, err := client.DeleteProducer(hostUUID, item.UUID)
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
