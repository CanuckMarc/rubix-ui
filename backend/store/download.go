package store

import (
	"errors"
	"github.com/NubeIO/git/pkg/git"
	"github.com/NubeIO/rubix-assist/namings"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"os"
	"path"
)

func (inst *AppStore) DownloadFlowPlugin(token string, app App) (*App, error) {
	app.Repo = constants.FlowFramework
	return inst.gitDownloadZip(token, app, false, true, git.DownloadOptions{
		AssetName: app.Name,
		MatchName: true,
		MatchArch: true,
	})
}

func (inst *AppStore) GitDownloadZip(token string, app App, doNotValidateArch, matchName, isZipball bool) (
	*App, error) {
	app.Repo = namings.GetRepoNameFromAppName(app.Name)
	opts := git.DownloadOptions{
		MatchArch: !doNotValidateArch,
		AssetName: app.Repo,
		MatchName: matchName,
	}
	return inst.gitDownloadZip(token, app, isZipball, false, opts)
}

func (inst *AppStore) gitDownloadZip(token string, app App, isZipball, isPlugin bool, gitOptions git.DownloadOptions) (
	*App, error) {
	if app.Name == "" {
		return nil, errors.New("download_app: app name can not be empty")
	}
	if app.Version == "" {
		return nil, errors.New("download_app: app version can not be empty")
	}
	if app.Repo == "" {
		return nil, errors.New("download_app: app repo can not be empty")
	}

	tmpDownloadDir := inst.Store.CreateTmpPath()
	if err := os.MkdirAll(tmpDownloadDir, os.FileMode(FilePerm)); err != nil {
		return nil, err
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
		return nil, err
	}

	destination := inst.GetAppStoreAppPath(app)
	if isPlugin {
		destination = inst.Store.UserPluginPath
	}
	if err = os.MkdirAll(destination, os.FileMode(inst.Store.Perm)); err != nil {
		return nil, err
	}

	if err = os.Rename(path.Join(tmpDownloadDir, *assetName), path.Join(destination, *assetName)); err != nil {
		return nil, err
	}

	if err = os.Remove(tmpDownloadDir); err != nil {
		return nil, err
	}

	return &app, nil
}
