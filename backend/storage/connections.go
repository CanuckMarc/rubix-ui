package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"github.com/tidwall/buntdb"
)

func matchUUID(uuid string) bool {
	if len(uuid) == 16 {
		if uuid[0:4] == "con_" {
			return true
		}
	}
	return false
}

func (inst *db) Add(rc *RubixConnection) (*RubixConnection, error) {
	if rc.Name == "" {
		rc.Name = fmt.Sprintf("conn-%s", uuid.ShortUUID("")[5:10])
	}
	if rc.Description == "" {
		rc.Description = "a rubix connection to devices"
	}
	if rc.IP == "" {
		rc.IP = "0.0.0.0"
	}
	if rc.Port == 0 {
		rc.Port = 1662
	}
	rc.UUID = uuid.ShortUUID("con")
	data, err := json.Marshal(rc)
	if err != nil {
		fmt.Printf("Error: %s", err)
		return nil, err
	}

	// check if one exists with same name
	name, _ := inst.SelectByName(rc.Name)
	if err != nil {
		return nil, err
	}
	if name != nil {
		return nil, errors.New("a connection with this name already exists")
	}

	if matchUUID(rc.Name) {
		return nil, errors.New("a connection name can not be named same as the uuid con_ and length of 16")
	}

	err = inst.DB.Update(func(tx *buntdb.Tx) error {
		_, _, err := tx.Set(rc.UUID, string(data), nil)
		return err
	})
	if err != nil {
		fmt.Printf("Error: %s", err)
		return nil, err
	}
	return rc, nil
}

func (inst *db) Update(uuid string, rc *RubixConnection) (*RubixConnection, error) {
	j, err := json.Marshal(rc)
	if err != nil {
		fmt.Printf("Error: %s", err)
		return nil, err
	}
	err = inst.DB.Update(func(tx *buntdb.Tx) error {
		_, _, err := tx.Set(uuid, string(j), nil)
		return err
	})
	if err != nil {
		fmt.Printf("Error: %s", err)
		return nil, err
	}
	return rc, nil
}

func (inst *db) Delete(uuid string) error {
	err := inst.DB.Update(func(tx *buntdb.Tx) error {
		_, err := tx.Delete(uuid)
		return err
	})
	if err != nil {
		fmt.Printf("Error delete: %s", err)
		return err
	}
	return nil
}

func (inst *db) Select(uuid string) (*RubixConnection, error) {
	if !matchUUID(uuid) {
		return inst.SelectByName(uuid)
	} else {
		var data *RubixConnection
		err := inst.DB.View(func(tx *buntdb.Tx) error {
			val, err := tx.Get(uuid)
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
			fmt.Printf("Error: %s", err)
			return nil, err
		}
		return data, nil
	}
}

func (inst *db) SelectByName(name string) (*RubixConnection, error) {
	all, err := inst.SelectAll()
	if err != nil {
		return nil, err
	}
	for _, connection := range all {
		if connection.Name == name {
			return &connection, nil
		}
	}
	return nil, errors.New(fmt.Sprintf("failed to find connection by name: %s", name))
}

func (inst *db) SelectAll() ([]RubixConnection, error) {
	var resp []RubixConnection
	err := inst.DB.View(func(tx *buntdb.Tx) error {
		err := tx.Ascend("", func(key, value string) bool {
			var data RubixConnection
			err := json.Unmarshal([]byte(value), &data)
			if err != nil {
				return false
			}
			if matchConnUUID(data.UUID) {
				resp = append(resp, data)
			}
			return true
		})
		return err
	})
	if err != nil {
		fmt.Printf("Error: %s", err)
		return []RubixConnection{}, err
	}
	return resp, nil
}

func (inst *db) Wipe() (int, error) {
	connections, err := inst.SelectAll()
	if err != nil {
		return 0, err
	}
	count := 0
	for _, connection := range connections {
		err = inst.Delete(connection.UUID)
		if err != nil {
			return 0, err
		}
		count++
	}
	return count, nil
}
