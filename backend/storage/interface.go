package storage

import "github.com/NubeIO/rubix-ui/backend/store"

type IStorage interface {
	AddRelease(body *store.Release) (*store.Release, error)
	GetReleases() ([]store.Release, error)
	GetRelease(uuid string) (*store.Release, error)
	GetReleaseByVersion(version string) (*store.Release, error)
	DeleteRelease(uuid string) error
	DeleteReleases() error
	Add(*RubixConnection) (*RubixConnection, error)
	Delete(uuid string) error
	Select(uuid string) (*RubixConnection, error)
	SelectByName(name string) (*RubixConnection, error)
	Update(string, *RubixConnection) (*RubixConnection, error)
	SelectAll() ([]RubixConnection, error)
	Close() error
	Wipe() (int, error)
	AddLog(*Log) (*Log, error)
	GetLogs() ([]Log, error)
	GetLogsByConnection(uuid string) ([]Log, error)
	DeleteLog(uuid string) error
	AddBackup(backup *Backup) (*Backup, error)
	GetBackup(uuid string) (*Backup, error)
	DeleteBackup(uuid string) error
	GetBackups() ([]Backup, error)
	GetBackupsByHostUUID(uuid string) ([]Backup, error)

	GetSettings() (*Settings, error)
	UpdateSettings(body *Settings) (*Settings, error)
	GetGitToken(previewToken bool) (string, error)
	SetGitToken(token string) (*Settings, error)
}
