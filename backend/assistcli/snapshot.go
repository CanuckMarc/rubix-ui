package assistcli

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"time"
)

type Snapshots struct {
	Name      string    `json:"name"`
	Size      int64     `json:"size"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateStatus string

const (
	Creating     CreateStatus = "Creating"
	Created      CreateStatus = "Created"
	CreateFailed CreateStatus = "Failed"
)

type SnapshotCreateLog struct {
	UUID      string       `json:"uuid" gorm:"primary_key" get:"true" delete:"true"`
	HostUUID  string       `json:"host_uuid" get:"true" post:"true"`
	Msg       string       `json:"msg" get:"true" post:"true" patch:"true"`
	Status    CreateStatus `json:"status" get:"true" post:"true" patch:"true"`
	CreatedAt time.Time    `json:"created_at" get:"true"`
}

type RestoreStatus string

const (
	Restoring     RestoreStatus = "Restoring"
	Restored      RestoreStatus = "Restored"
	RestoreFailed RestoreStatus = "Failed"
)

type SnapshotRestoreLog struct {
	UUID      string        `json:"uuid" gorm:"primary_key" get:"true" delete:"true"`
	HostUUID  string        `json:"host_uuid" get:"true" post:"true" patch:"true"`
	Msg       string        `json:"msg" get:"true" post:"true" patch:"true"`
	Status    RestoreStatus `json:"status" get:"true" post:"true" patch:"true"`
	CreatedAt time.Time     `json:"created_at" get:"true"`
}

func (inst *Client) EdgeGetSnapshots(hostIDName string) ([]Snapshots, error) {
	url := fmt.Sprintf("/api/edge/snapshots")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]Snapshots{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []Snapshots
	out = *resp.Result().(*[]Snapshots)
	return out, nil
}

func (inst *Client) EdgeGetSnapshotsCreateLogs(hostIDName string) ([]SnapshotCreateLog, error) {
	url := fmt.Sprintf("/api/edge/snapshots/create-logs")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]SnapshotCreateLog{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []SnapshotCreateLog
	out = *resp.Result().(*[]SnapshotCreateLog)
	return out, nil
}

func (inst *Client) EdgeGetSnapshotsRestoreLogs(hostIDName string) ([]SnapshotRestoreLog, error) {
	url := fmt.Sprintf("/api/edge/snapshots/restore-logs")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&[]SnapshotRestoreLog{}).
		Get(url))
	if err != nil {
		return nil, err
	}
	var out []SnapshotRestoreLog
	out = *resp.Result().(*[]SnapshotRestoreLog)
	return out, nil
}

func (inst *Client) EdgeCreateSnapshot(hostIDName string) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshots/create")
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}

func (inst *Client) EdgeDeleteSnapshot(hostIDName, fileName string) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshots?file=%s", fileName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Delete(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}

func (inst *Client) EdgeRestoreSnapshot(hostIDName, fileName string) (*Message, error) {
	url := fmt.Sprintf("/api/edge/snapshots/restore?file=%s", fileName)
	resp, err := nresty.FormatRestyResponse(inst.Rest.R().
		SetHeader("host-uuid", hostIDName).
		SetHeader("host-name", hostIDName).
		SetResult(&Message{}).
		Post(url))
	if err != nil {
		return nil, err
	}
	return resp.Result().(*Message), nil
}
