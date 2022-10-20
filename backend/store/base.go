package store

import (
	"errors"
	"github.com/NubeIO/git/pkg/git"
	fileutils "github.com/NubeIO/lib-dirs/dirs"
	"github.com/NubeIO/lib-rubix-installer/installer"
	"os"
	"path"
)

const root = 0755

var FilePerm = root
var gitClient *git.Client

type InstallResponse struct {
	AppName    string
	AppVersion string
	Plugins    []string
}

type Store struct {
	App               *installer.App
	Perm              int    `json:"file_perm"`
	UserPath          string `json:"user_path"`            // ~/rubix
	UserStorePath     string `json:"user_store_path"`      // ~/rubix/store
	UserStoreAppsPath string `json:"user_store_apps_path"` // ~/rubix/store/apps
	UserPluginPath    string `json:"user_plugin_path"`     // ~/rubix/store/plugins
	UserTmpPath       string `json:"user_tmp_path"`        // ~/rubix/tmp
	Owner             string `json:"owner"`                // NubeIO
	BackupsDir        string `json:"backups_dir"`          // ~/backups
}

func New(store *Store) (*Store, error) {
	homeDir, _ := fileutils.HomeDir()
	if store == nil {
		return nil, errors.New("store can not be empty")
	}
	if store.App == nil {
		store.App = installer.New(&installer.App{})
	}
	if store.Perm == 0 {
		store.Perm = FilePerm
	}
	if store.UserPath == "" {
		store.UserPath = path.Join(homeDir, "rubix")
	}
	if store.UserStorePath == "" {
		store.UserStorePath = path.Join(store.UserPath, "store")
	}
	if store.UserStoreAppsPath == "" {
		store.UserStoreAppsPath = path.Join(store.UserStorePath, "apps")
	}
	if store.UserPluginPath == "" {
		store.UserPluginPath = path.Join(store.UserStorePath, "plugins")
	}
	if store.UserTmpPath == "" {
		store.UserTmpPath = path.Join(store.UserStorePath, "tmp")
	}
	if store.Owner == "" {
		store.Owner = "NubeIO"
	}
	if store.BackupsDir == "" {
		store.BackupsDir = path.Join(store.UserPath, "backups")
	}
	err := store.initMakeAllDirs()
	if err != nil {
		return nil, err
	}
	return store, nil
}

func (inst *Store) initMakeAllDirs() error {
	if err := os.MkdirAll(inst.UserPath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.UserStorePath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.UserStoreAppsPath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.UserStoreAppsPath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.UserPluginPath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.UserTmpPath, os.FileMode(FilePerm)); err != nil {
		return err
	}
	if err := os.MkdirAll(inst.BackupsDir, os.FileMode(FilePerm)); err != nil {
		return err
	}
	return nil
}