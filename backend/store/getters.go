package store

import (
	"github.com/NubeIO/lib-uuid/uuid"
	"path"
)

func (inst *AppStore) GetBackupPath() string {
	return inst.Store.BackupsDir
}

// GetAppStoreAppPath get the full app install path and version => ~/rubix/store/apps/rubix-wires/<amd64|armv7>/<version>
func (inst *AppStore) GetAppStoreAppPath(app App) string {
	return path.Join(inst.Store.UserStoreAppsPath, app.Name, app.Arch, app.Version)
}

func (inst *Store) CreateTmpPath() string {
	return path.Join(inst.UserTmpPath, uuid.ShortUUID("tmp"))
}
