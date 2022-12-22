package storage

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/constants"
	log "github.com/sirupsen/logrus"
	"github.com/tidwall/buntdb"
)

type AutoRefresh struct {
	Enable bool `json:"enable"`
	Rate   int  `json:"rate"`
}

type Settings struct {
	UUID              string `json:"uuid"`
	Theme             string `json:"theme"` // light, dark
	GitToken          string `json:"git_token"`
	AutoRefreshEnable bool   `json:"auto_refresh_enable"`
	AutoRefreshRate   int    `json:"auto_refresh_rate"`
}

func (inst *db) GetSettingsList() ([]Settings, error) {
	var resp []Settings
	err := inst.DB.View(func(tx *buntdb.Tx) error {
		err := tx.Ascend("", func(key, value string) bool {
			var data Settings
			err := json.Unmarshal([]byte(value), &data)
			if err != nil {
				return false
			}
			if matchSettingsUUID(key) {
				resp = append(resp, data)
			}
			return true
		})
		return err
	})
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return resp, nil
}

func (inst *db) GetSettings() (*Settings, error) {
	settingsList, err := inst.GetSettingsList()
	if err != nil {
		return nil, err
	}
	if len(settingsList) == 0 {
		return nil, errors.New("no settings have been added")
	}
	var data *Settings
	err = inst.DB.View(func(tx *buntdb.Tx) error {
		val, err := tx.Get(constants.SettingUUID)
		if err != nil {
			return err
		}
		err = json.Unmarshal([]byte(val), &data)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return data, nil
}

func (inst *db) AddSettings(body *Settings) (*Settings, error) {
	settingsList, err := inst.GetSettingsList()
	if err != nil {
		return nil, err
	}
	if len(settingsList) > 0 {
		return nil, errors.New("settings can only be added once")
	}
	body.UUID = constants.SettingUUID
	if body.GitToken != "" {
		body.GitToken = encodeToken(body.GitToken)
	}
	data, err := json.Marshal(body)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	err = inst.DB.Update(func(tx *buntdb.Tx) error {
		_, _, err := tx.Set(body.UUID, string(data), nil)
		return err
	})
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return body, nil
}

func (inst *db) UpdateSettings(body *Settings) (*Settings, error) {
	settingsList, err := inst.GetSettingsList()
	if err != nil {
		return nil, err
	}
	if len(settingsList) == 0 { // add settings if not existing
		addSettings, err := inst.AddSettings(body)
		if err != nil {
			return nil, err
		}
		return addSettings, err
	}
	body.UUID = constants.SettingUUID
	body.GitToken = settingsList[0].GitToken // don't edit git token
	j, err := json.Marshal(body)
	if err != nil {
		log.Error(err)
		return nil, err
	}
	err = inst.DB.Update(func(tx *buntdb.Tx) error {
		_, _, err := tx.Set(constants.SettingUUID, string(j), nil)
		return err
	})
	if err != nil {
		log.Error(err)
		return nil, err
	}
	return body, nil
}

func (inst *db) DeleteSettings() error {
	settingsList, err := inst.GetSettingsList()
	if err != nil {
		return err
	}
	if len(settingsList) == 0 {
		return errors.New("no settings have been added")
	}
	uuid := settingsList[0].UUID
	err = inst.DB.Update(func(tx *buntdb.Tx) error {
		_, err := tx.Delete(uuid)
		return err
	})
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

func (inst *db) GetGitToken(previewToken bool) (string, error) {
	var data *Settings
	err := inst.DB.View(func(tx *buntdb.Tx) error {
		val, err := tx.Get(constants.SettingUUID)
		if err != nil {
			return err
		}
		err = json.Unmarshal([]byte(val), &data)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		log.Error(err)
		return "", err
	}
	if data.GitToken != "" {
		data.GitToken = decodeToken(data.GitToken)
	}
	if previewToken {
		return getPreviewToken(data.GitToken), nil
	}
	return data.GitToken, nil
}

func (inst *db) SetGitToken(token string) (*Settings, error) {
	if len(token) <= 13 || token[10:13] == "..." {
		return nil, errors.New("token validation failed")
	}
	settingsList, err := inst.GetSettingsList()
	if err != nil {
		return nil, err
	}
	if len(settingsList) == 0 { // add settings if not existing
		setting := Settings{
			UUID:              constants.SettingUUID,
			Theme:             "dark",
			GitToken:          encodeToken(token),
			AutoRefreshEnable: false,
			AutoRefreshRate:   5000,
		}
		_settings, err := inst.AddSettings(&setting)
		if err != nil {
			return nil, err
		}
		_settings.GitToken = getPreviewToken(_settings.GitToken)
		return _settings, nil
	} else {
		_settings := settingsList[0]
		_settings.GitToken = encodeToken(token)
		j, err := json.Marshal(_settings)
		if err != nil {
			log.Error(err)
			return nil, err
		}
		err = inst.DB.Update(func(tx *buntdb.Tx) error {
			_, _, err := tx.Set(constants.SettingUUID, string(j), nil)
			return err
		})
		if err != nil {
			log.Error(err)
			return nil, err
		}
		_settings.GitToken = getPreviewToken(_settings.GitToken)
		return &_settings, nil
	}
}

func encodeToken(token string) string {
	return base64.StdEncoding.EncodeToString([]byte(token))
}

func decodeToken(token string) string {
	data, _ := base64.StdEncoding.DecodeString(token)
	return string(data)
}

func getPreviewToken(token string) string {
	if len(token) > 13 {
		return fmt.Sprintf("%s...", token[0:10])
	} else {
		return fmt.Sprintf("invalid token...")
	}
}
