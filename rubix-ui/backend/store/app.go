package store

import (
	"errors"
	"fmt"
	"github.com/NubeIO/lib-uuid/uuid"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

type App struct {
	Name          string `json:"name"`    // rubix-wires
	Version       string `json:"version"` // v1.1.1
	Repo          string `json:"repo"`    // wires-builds
	Arch          string `json:"arch"`
	RealseVersion string `json:"realse_version"`
}

func (inst *Store) initMakeAllDirs() error {
	if err := inst.makeUserPath(); err != nil {
		return err
	}
	if err := inst.makeUserStorePath(); err != nil {
		return err
	}
	if err := inst.makeUserPathTmp(); err != nil {
		return err
	}
	if err := inst.makeUserConfig(); err != nil {
		return err
	}
	if err := inst.makeBackupPath(); err != nil {
		return err
	}
	return nil
}

// AddApp make all the app store dirs
func (inst *Store) AddApp(app *App) (*App, error) {
	appName := app.Name
	version := app.Version
	if appName == "" {
		return nil, errors.New("app name can not be empty")
	}
	if version == "" {
		return nil, errors.New("app version can not be empty")
	}
	if err := inst.makeUserPath(); err != nil {
		return nil, err
	}
	if err := inst.makeUserStorePath(); err != nil {
		return nil, err
	}
	if err := inst.makeApp(appName); err != nil {
		return nil, err
	}
	if err := inst.makeAppVersionDir(appName, version); err != nil {
		return nil, err
	}
	if appName == flow {
		if version == "" {
			return nil, errors.New("app realse version can not be empty when adding a plugin")
		}
		if err := inst.makePluginDirs(flow, app.RealseVersion); err != nil {
			return nil, err
		}
	}
	return app, nil
}

func (inst *Store) ListStore() ([]App, error) {
	rootDir := inst.getUserStorePath()
	var files []App
	app := App{}
	err := filepath.WalkDir(rootDir, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() && strings.Count(p, string(os.PathSeparator)) == 5 {
			parts := strings.Split(p, "/")
			if len(parts) >= 4 { // app name
				app.Name = parts[4]
			}
			if len(parts) >= 5 { // version
				app.Version = parts[5]
			}
			files = append(files, app)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

//StoreCheckAppExists  => /user/rubix/store/apps/flow-framework/
func (inst *Store) StoreCheckAppExists(appName string) error {
	if err := emptyPath(appName); err != nil {
		return err
	}
	path := fmt.Sprintf("%s/%s", inst.getUserStorePathApps(), appName)
	found := inst.App.DirExists(path)
	if !found {
		return errors.New(fmt.Sprintf("failed to find app:%s in app-store", appName))
	}
	return nil
}

//StoreCheckAppAndVersionExists  => /user/rubix/store/apps/flow-framework/v1.1.1
func (inst *Store) StoreCheckAppAndVersionExists(appName, version string) error {
	if err := emptyPath(appName); err != nil {
		return err
	}
	if err := checkVersion(version); err != nil {
		return err
	}
	path := fmt.Sprintf("%s/%s/%s", inst.getUserStorePathApps(), appName, version)
	found := inst.App.DirExists(path)
	if !found {
		return errors.New(fmt.Sprintf("failed to find app:%s version:%s in app-store", appName, version))
	}
	return nil
}

//makeUserPath  => /home/user/rubix
func (inst *Store) makeUserPath() error {
	return inst.App.MakeDirectoryIfNotExists(inst.getUserPath(), os.FileMode(FilePerm))
}

//makeUserStorePath  => /hom/user/rubix/store
func (inst *Store) makeUserStorePath() error {
	return inst.App.MakeDirectoryIfNotExists(inst.getUserStorePath(), os.FileMode(FilePerm))
}

//makeUserStorePath  => /hom/user/rubix/tmp
func (inst *Store) makeUserPathTmp() error {
	return inst.App.MakeDirectoryIfNotExists(fmt.Sprintf("%s/tmp", inst.getUserPath()), os.FileMode(FilePerm))
}

//makeUserStorePath  => /hom/user/rubix/tmp
func (inst *Store) makeUserPathTmpDir() (string, error) {
	dir := uuid.ShortUUID("tmp")
	path := fmt.Sprintf("%s/tmp/%s", inst.getUserPath(), dir)
	return path, inst.App.MakeDirectoryIfNotExists(path, os.FileMode(FilePerm))
}

//makeUserStorePath  => /hom/user/rubix/config
func (inst *Store) makeUserConfig() error {
	return inst.App.MakeDirectoryIfNotExists(fmt.Sprintf("%s/config", inst.getUserPath()), os.FileMode(FilePerm))
}

//MakeAppConfig  => /hom/user/rubix/config/bacnet-server
func (inst *Store) MakeAppConfig(appName string) error {
	return inst.App.MakeDirectoryIfNotExists(fmt.Sprintf("%s/config/%s", inst.getUserPath(), appName), os.FileMode(FilePerm))
}

//GetUserConfig  => /home/user/rubix/config
func (inst *Store) GetUserConfig() string {
	return fmt.Sprintf("%s/config", inst.getUserPath())
}

//makeUserPath  => /home/user/rubix/backups
func (inst *Store) makeBackupPath() error {
	return inst.App.MakeDirectoryIfNotExists(inst.BackupsDir, os.FileMode(FilePerm))
}

//MakeApp  => /data/store/apps/flow-framework
func (inst *Store) makeApp(appName string) error {
	if err := emptyPath(appName); err != nil {
		return err
	}
	path := fmt.Sprintf("%s/%s", inst.getUserStorePathApps(), appName)
	return inst.App.MakeDirectoryIfNotExists(path, os.FileMode(FilePerm))
}

//MakeAppVersionDir  => /user/rubix/store/apps/flow-framework/v1.1.1
func (inst *Store) makeAppVersionDir(appName, version string) error {
	if err := emptyPath(appName); err != nil {
		return err
	}
	if err := checkVersion(version); err != nil {
		return err
	}
	path := fmt.Sprintf("%s/%s/%s", inst.getUserStorePathApps(), appName, version)
	return inst.App.MakeDirectoryIfNotExists(path, os.FileMode(FilePerm))
}

//MakeAppVersionDir  => /user/rubix/store/apps/flow-framework/v1.1.1
func (inst *Store) makePluginDirs(appName, realseVersion string) error {
	if err := emptyPath(appName); err != nil {
		return err
	}
	if err := checkVersion(realseVersion); err != nil {
		return err
	}
	path := fmt.Sprintf("%s/%s/%s/plugins/amd64", inst.getUserStorePathApps(), appName, realseVersion)
	err := inst.App.MakeDirectoryIfNotExists(path, os.FileMode(FilePerm))
	if err != nil {
		return err
	}
	path = fmt.Sprintf("%s/%s/%s/plugins/armv7", inst.getUserStorePathApps(), appName, realseVersion)
	err = inst.App.MakeDirectoryIfNotExists(path, os.FileMode(FilePerm))
	if err != nil {
		return err
	}
	return nil
}
