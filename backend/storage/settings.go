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

func (inst *db) GetSettings() (*Settings, error) {
	var data *Settings
	err := inst.DB.View(func(tx *buntdb.Tx) error {
		val, err := tx.Get(constants.SettingUUID)
		if err != nil {
			if err == buntdb.ErrNotFound {
				return errors.New("no settings has been added")
			}
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

func (inst *db) UpdateSettings(body *Settings) (*Settings, error) {
	settings, _ := inst.GetSettings()
	body.UUID = constants.SettingUUID
	if settings != nil {
		body.GitToken = settings.GitToken // don't edit git token
	}
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
	settings, _ := inst.GetSettings()
	if settings == nil { // add settings if not existing
		setting := Settings{
			UUID:              constants.SettingUUID,
			Theme:             "dark",
			GitToken:          encodeToken(token),
			AutoRefreshEnable: false,
			AutoRefreshRate:   5000,
		}
		_settings, err := inst.UpdateSettings(&setting)
		if err != nil {
			return nil, err
		}
		_settings.GitToken = getPreviewToken(_settings.GitToken)
		return _settings, nil
	} else {
		settings.GitToken = encodeToken(token)
		j, err := json.Marshal(settings)
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
		settings.GitToken = getPreviewToken(settings.GitToken)
		return settings, nil
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
