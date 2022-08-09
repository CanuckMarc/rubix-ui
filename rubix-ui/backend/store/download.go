package store

import (
	"errors"
	"fmt"
	"github.com/NubeIO/git/pkg/git"
)

const flow = "flow-framework"
const rubixWires = "rubix-wires"
const wiresBuilds = "wires-builds"

// DownloadAll make all the app store dirs
func (inst *Store) DownloadAll(token string, cleanDownload bool, release *Release) ([]App, error) {
	var out []App
	for _, app := range release.Apps { // download all others apps
		if app.Name == rubixWires {
			wires, err := inst.DownloadWires(token, app.Version, cleanDownload)
			if err != nil {
				return nil, err
			}
			out = append(out, *wires)
		} else if len(app.Arch) > 0 {
			for _, arch := range app.Arch { // download both version of each app
				app, err := inst.gitDownloadAsset(token, app.Name, app.Version, app.Repo, arch, "", cleanDownload, false, git.DownloadOptions{
					AssetName: app.Repo,
					MatchName: true,
					MatchArch: true,
				})
				if err != nil {
					return nil, err
				}
				out = append(out, *app)
			}
		}
	}
	return out, nil
}

// DownloadFlowPlugin download ff
func (inst *Store) DownloadFlowPlugin(token, version, pluginName, arch, realseVersion string, cleanDownload bool) (*App, error) {
	app, err := inst.gitDownloadAsset(token, flow, version, flow, arch, realseVersion, cleanDownload, true, git.DownloadOptions{
		AssetName: pluginName,
		MatchName: true,
		MatchArch: true,
	})
	if err != nil {
		return nil, err
	}
	return app, nil
}

// DownloadWires download rubix-wires
func (inst *Store) DownloadWires(token, version string, cleanDownload bool) (*App, error) {
	app, err := inst.gitDownloadAsset(token, rubixWires, version, wiresBuilds, "", "", cleanDownload, false, git.DownloadOptions{
		AssetName:     rubixWires,
		DownloadFirst: true,
	})
	if err != nil {
		return nil, err
	}
	return app, nil
}

// GitDownloadAsset download an app
func (inst *Store) GitDownloadAsset(token, appName, version, repo, arch, realseVersion string, cleanDownload bool, gitOptions git.DownloadOptions) (*App, error) {
	return inst.gitDownloadAsset(token, appName, version, repo, arch, realseVersion, cleanDownload, false, gitOptions)
}

// gitDownloadAsset download an app
func (inst *Store) gitDownloadAsset(token, appName, version, repo, arch, realseVersion string, cleanDownload, isPlugin bool, gitOptions git.DownloadOptions) (*App, error) {
	newApp := &App{
		Name:          appName,
		Version:       version,
		Repo:          repo,
		Arch:          arch,
		RealseVersion: realseVersion,
	}
	if newApp.Name == "" {
		return nil, errors.New("downloadApp: app name can not be empty")
	}
	if newApp.Version == "" {
		return nil, errors.New("downloadApp: app version can not be empty")
	}
	if newApp.Repo == "" {
		return nil, errors.New("downloadApp: app repo can not be empty")
	}
	app, err := inst.AddApp(newApp)
	if err != nil {
		return nil, err
	}
	gitOptions.DownloadDestination = inst.getAppPathAndVersion(newApp.Name, newApp.Version)
	if isPlugin {
		if arch == "amd64" {
			gitOptions.DownloadDestination = fmt.Sprintf("%s/plugins/amd64", inst.getAppPathAndVersion(newApp.Name, newApp.Version))
		} else {
			gitOptions.DownloadDestination = fmt.Sprintf("%s/plugins/armv7", inst.getAppPathAndVersion(newApp.Name, newApp.Version))
		}
	}
	var runDownload bool
	var buildNameMatch bool
	var buildArchMatch bool
	if cleanDownload {
		runDownload = true
	} else {
		path := inst.getAppPathAndVersion(appName, version)
		buildDetails, err := inst.App.GetBuildZipNameByArch(path, arch, false)
		if err != nil {
			return nil, err
		}
		if buildDetails != nil {
			buildName := buildDetails.MatchedName
			buildArch := buildDetails.MatchedArch
			if buildName == gitOptions.AssetName {
				buildNameMatch = true
			}
			if buildArch == arch {
				buildArchMatch = true
			}
			if buildNameMatch && buildArchMatch {
				runDownload = false
			} else {
				runDownload = true
			}
		} else {
			runDownload = true
		}
	}
	if runDownload {
		_, err = inst.GitDownload(newApp.Repo, newApp.Version, arch, token, gitOptions)
		if err != nil {
			return nil, err
		}
		return app, nil
	}
	return app, nil

}
