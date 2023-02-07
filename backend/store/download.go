package store

import (
	"errors"
	"fmt"
	"github.com/NubeDev/flow-eng/helpers/str"
	"github.com/NubeIO/git/pkg/git"
	"github.com/NubeIO/rubix-assist/namings"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"os"
	"path"
)

func (inst *AppStore) DownloadFlowPlugin(token string, app App) (*App, error) {
	app.Repo = constants.FlowFramework
	opts := git.DownloadOptions{
		AssetName: app.Name,
		MatchName: true,
		MatchArch: true,
	}
	resp, _, err := inst.gitDownloadZip(token, app, true, false, false, opts)
	return resp, err
}

func (inst *AppStore) GitDownloadZip(token string, app App, doNotValidateArch, matchName, isZipball bool) (
	*App, error) {
	app.Repo = namings.GetRepoNameFromAppName(app.Name)
	opts := git.DownloadOptions{
		MatchArch: !doNotValidateArch,
		AssetName: app.Repo,
		MatchName: matchName,
	}
	resp, _, err := inst.gitDownloadZip(token, app, isZipball, false, false, opts)
	return resp, err
}

func (inst *AppStore) DownloadIO16Firmware(token, version string) (string, error) {
	_, assetName, err := inst.downloadIO16Firmware(token, version)
	if err != nil {
		return "", err
	}
	fullAsset := path.Join(inst.Store.IO16FirmwareDir, assetName)
	_, err = inst.Unzip(fullAsset, inst.Store.IO16FirmwareDir, os.FileMode(inst.Store.Perm))
	return fullAsset, err
}

func (inst *AppStore) downloadIO16Firmware(token string, version string) (*App, string, error) {
	assetName := fmt.Sprintf("r-io-modbus-%s", version)
	opts := git.DownloadOptions{
		AssetName:    assetName,
		MatchName:    false,
		MatchArch:    false,
		NameContains: true,
	}
	app := App{
		Repo:    constants.RubixIO16Repo,
		Name:    constants.RubixIO16Repo,
		Version: version,
	}
	return inst.gitDownloadZip(token, app, false, false, true, opts)

}

func (inst *AppStore) gitDownloadZip(token string, app App, isZipball, isPlugin, isFirmware bool, gitOptions git.DownloadOptions) (*App, string, error) {
	if app.Name == "" {
		return nil, "", errors.New("download_app: app name can not be empty")
	}
	if app.Version == "" {
		return nil, "", errors.New("download_app: app version can not be empty")
	}
	if app.Repo == "" {
		return nil, "", errors.New("download_app: app repo can not be empty")
	}

	tmpDownloadDir := inst.Store.CreateTmpPath()
	if err := os.MkdirAll(tmpDownloadDir, os.FileMode(FilePerm)); err != nil {
		return nil, "", err
	}

	var assetName *string
	var err error
	gitOptions.DownloadDestination = tmpDownloadDir
	if isZipball {
		assetName, err = inst.gitDownloadZipball(app, token, gitOptions)
	} else {
		assetName, err = inst.gitDownloadAsset(app, token, gitOptions)
	}
	if err != nil {
		return nil, "", err
	}
	destination := inst.GetAppStoreAppPath(app)
	if isPlugin {
		destination = inst.Store.UserPluginPath
	}
	if isFirmware {
		destination = inst.Store.IO16FirmwareDir
	}
	if err = os.MkdirAll(destination, os.FileMode(inst.Store.Perm)); err != nil {
		return nil, "", err
	}

	if err = os.Rename(path.Join(tmpDownloadDir, *assetName), path.Join(destination, *assetName)); err != nil {
		return nil, "", err
	}

	if err = os.Remove(tmpDownloadDir); err != nil {
		return nil, "", err
	}

	return &app, str.NonNil(assetName), nil
}
