package backend

import (
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-assist/service/systemctl"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/store"
	"github.com/hashicorp/go-version"
)

// EdgeInstallApp install an app
// if app is FF then we need to upgrade all the plugins
// if app has plugins to upload the plugins and restart FF
func (inst *App) EdgeInstallApp(connUUID, hostUUID, appName, appVersion string) *rumodel.Response {
	if appName == "" {
		return inst.fail("app name can't be empty")
	}
	if appVersion == "" {
		return inst.fail("app version can't be empty")
	}

	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return inst.fail(err)
	}

	var arch string
	resp, err := assistClient.EdgeBiosArch(hostUUID)
	if err != nil {
		return inst.fail(fmt.Sprintf("%s, turn on BIOS on your edge device", err))
	}
	arch = resp.Arch

	inst.uiSuccessMessage(fmt.Sprintf("%s app installation has been started (version: %s, arch: %s)", appName, appVersion, arch))

	_, err = assistClient.EdgeWriteConfig(hostUUID, appName)
	if err != nil {
		return inst.fail(fmt.Sprintf("%s app config write failure (%s)", appName, err))
	}

	isFlowFrameworkInstall := false
	var releaseVersion string
	if appName == constants.FlowFramework {
		releaseVersion = appVersion // FlowFramework installation should select same release version
	} else {
		ffVersion, connectionErr, _ := inst.getFlowFrameworkVersion(assistClient, hostUUID)
		if connectionErr != nil {
			return inst.fail(err)
		}
		if ffVersion != "" {
			isFlowFrameworkInstall = true
			releaseVersion = ffVersion
		} else {
			rv, err := inst.getLatestReleaseVersion()
			if err != nil {
				return inst.fail(err)
			}
			releaseVersion = rv
		}
	}

	var lastStep = "5"
	release, err := inst.DB.GetReleaseByVersion(releaseVersion)
	if release == nil {
		return inst.fail(fmt.Sprintf("failed to find release version %s on database", releaseVersion))
	}
	inst.uiSuccessMessage(fmt.Sprintf("(step 1 of %s) selected release version: %s", lastStep, releaseVersion))

	var appHasPlugins bool
	var selectedApp store.Apps
	for _, app := range release.Apps {
		if app.Name == appName {
			selectedApp = app
			for _, plg := range app.PluginDependency {
				appHasPlugins = true
				inst.uiSuccessMessage(fmt.Sprintf("%s plugin will be installed", plg))
			}
		}
	}

	if appHasPlugins && !isFlowFrameworkInstall {
		return inst.fail(fmt.Sprintf("%s app has plugin dependency, so you have to install flow-framework at first", appName))
	}

	app := store.App{
		Name:    appName,
		Version: appVersion,
		Arch:    arch,
	}

	err = inst.appStore.StoreCheckAppAndVersionExists(app)
	if err != nil {
		token, err := inst.GetGitToken(constants.SettingUUID, false)
		if err != nil {
			inst.fail(fmt.Sprintf("failed to get git token %s", err))
			return nil
		}
		inst.StoreDownloadApp(token, releaseVersion, appName, appVersion, arch)
		inst.uiSuccessMessage(fmt.Sprintf("(step 2 of %s) %s app is downloaded on app store", lastStep, appName))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("(step 2 of %s) %s already exist on app store", lastStep, appName))
	}

	_, skip, err := inst.assistAddUploadApp(assistClient, app, selectedApp.DoNotValidateArch)
	if err != nil {
		return inst.fail(err)
	}
	if skip {
		inst.uiSuccessMessage(fmt.Sprintf("(step 3 of %s) %s already exists on rubix-assist server", lastStep, appName))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("(step 3 of %s) %s is uploaded app to rubix-assist server", lastStep, appName))
	}

	appUpload := amodel.AppUpload{
		Name:                            appName,
		Version:                         appVersion,
		Arch:                            arch,
		MoveExtractedFileToNameApp:      selectedApp.MoveExtractedFileToNameApp,
		MoveOneLevelInsideFileToOutside: selectedApp.MoveOneLevelInsideFileToOutside,
	}
	_, err = assistClient.EdgeAppUpload(hostUUID, &appUpload)
	if err != nil {
		return inst.fail(err)
	}
	inst.uiSuccessMessage(fmt.Sprintf("(step 4 of %s) %s app is uploaded to edge", lastStep, appName))

	if appHasPlugins {
		_, connectionErr, _ := assistClient.EdgeDeleteDownloadPlugins(hostUUID)
		if connectionErr != nil {
			return inst.fail(connectionErr)
		}
		for _, app := range release.Apps {
			if app.Name == appName {
				for _, plg := range app.PluginDependency {
					if err := inst.edgeUploadPlugin(assistClient, hostUUID, &amodel.Plugin{
						Name:    plg,
						Arch:    arch,
						Version: releaseVersion,
					}); err != nil {
						return inst.fail(err)
					}
				}
			}
		}
	}

	if appName == constants.FlowFramework { // if app is FF then update all the plugins
		err := inst.reAddEdgeUploadPlugins(assistClient, hostUUID, releaseVersion, arch)
		if err != nil {
			return inst.fail(err)
		}
	}

	appInstall := systemctl.ServiceFile{
		Name:                        appName,
		Version:                     appVersion,
		ExecStart:                   selectedApp.ExecStart,
		AttachWorkingDirOnExecStart: selectedApp.AttachWorkingDirOnExecStart,
		EnvironmentVars:             selectedApp.EnvironmentVars,
	}

	_, err = assistClient.EdgeAppInstall(hostUUID, &appInstall)
	if err != nil {
		return inst.fail(err)
	}
	inst.uiSuccessMessage(fmt.Sprintf("(step 5 of %s) %s app installed on the edge", lastStep, appName))

	if appHasPlugins {
		if err = inst.restartFlowFramework(assistClient, hostUUID); err != nil {
			inst.fail(err)
		}
	}
	return inst.success(fmt.Sprintf("%s is successfully installed", appName))
}

func (inst *App) EdgeUnInstallApp(connUUID, hostUUID, appName string) *amodel.Message {
	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	resp, err := assistClient.EdgeAppUninstall(hostUUID, appName)
	if err != nil {
		inst.uiErrorMessage(err)
		return nil
	}
	return resp
}

func (inst *App) EdgeAppsInfo(connUUID, hostUUID string) *rumodel.Response {
	edgeAppsAndService, err := inst.edgeAppsInfo(connUUID, hostUUID)
	if err != nil {
		return inst.fail(err)
	}
	return inst.successResponse(edgeAppsAndService)
}

// edgeAppsInfo get the complete app info of the device, installed apps, what apps can be installed and the product info
func (inst *App) edgeAppsInfo(connUUID, hostUUID string) (*rumodel.EdgeAppsInfo, error) {
	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	releaseVersion, err := inst.getReleaseVersion(assistClient, hostUUID)
	if err != nil {
		return nil, err
	}
	release, err := inst.DB.GetRelease(*releaseVersion)
	if release == nil {
		// if not exist then try and download the version
		token, err := inst.GetGitToken(constants.SettingUUID, false)
		if err != nil {
			return nil, err
		}
		release, err = inst.gitDownloadRelease(token, *releaseVersion)
		if err != nil {
			return nil, err
		}
	}
	if release == nil {
		return nil, errors.New(fmt.Sprintf("failed to find a valid release: %s", *releaseVersion))
	}

	deviceInfo, err := assistClient.GetEdgeDeviceInfo(hostUUID)
	if err != nil {
		return nil, err
	}
	installedApps, err := inst.edgeInstalledApps(assistClient, hostUUID)
	if err != nil {
		return nil, err
	}
	var appsList []rumodel.InstalledApps
	var appsAvailable []rumodel.AppsAvailableForInstall
	for _, versionApp := range release.Apps { // list all the that the edge device can install
		for _, pro := range versionApp.Products {
			if deviceInfo.DeviceType == pro {
				var appAvailable rumodel.AppsAvailableForInstall
				appAvailable.AppName = versionApp.Name
				appAvailable.MinVersion = versionApp.MinVersion
				appAvailable.MaxVersion = versionApp.MaxVersion
				appsAvailable = append(appsAvailable, appAvailable)
			}
		}
	}
	for _, installedApp := range installedApps {
		for _, app := range release.Apps {
			if installedApp.AppName == app.Name {
				installedAppVersion, err := version.NewVersion(installedApp.Version)
				if err != nil {
					return nil, err
				}
				minVersion := app.MinVersion
				maxVersion := app.MaxVersion
				if app.MinVersion == "" {
					minVersion = "v0.0.0"
				}
				if app.MaxVersion == "" {
					maxVersion = "v1000.0.0"
				}
				minAppVersion, err := version.NewVersion(minVersion)
				if err != nil {
					return nil, err
				}
				maxAppVersion, err := version.NewVersion(maxVersion)
				if err != nil {
					return nil, err
				}
				installedApp.IsInstalled = true
				installedApp.MinVersion = app.MinVersion
				installedApp.MaxVersion = app.MaxVersion
				if installedAppVersion.GreaterThanOrEqual(minAppVersion) && installedAppVersion.LessThanOrEqual(maxAppVersion) {
					installedApp.Match = true
				} else {
					if installedAppVersion.LessThan(minAppVersion) {
						installedApp.UpgradeRequired = true
					} else {
						installedApp.DowngradeRequired = true
					}
				}
				appsList = append(appsList, installedApp)
			}
		}
	}

	return &rumodel.EdgeAppsInfo{
		InstalledApps:           appsList,
		AppsAvailableForInstall: appsAvailable,
	}, nil
}

func (inst *App) edgeInstalledApps(assistClient *assistcli.Client, hostUUID string) ([]rumodel.InstalledApps, error) {
	apps, err := assistClient.EdgeListAppsStatus(hostUUID)
	if err != nil {
		return nil, err
	}
	var filteredApps []rumodel.InstalledApps
	var filteredApp rumodel.InstalledApps
	for _, installedApp := range apps {
		filteredApp.IsInstalled = false
		filteredApp.AppName = installedApp.Name
		filteredApp.Version = installedApp.Version
		filteredApp.ServiceName = installedApp.ServiceName
		filteredApp.State = string(installedApp.State.State)
		filteredApp.ActiveState = string(installedApp.State.ActiveState)
		filteredApp.SubState = string(installedApp.State.SubState)
		if filteredApp.State != "" {
			filteredApp.IsInstalled = true
		}
		filteredApps = append(filteredApps, filteredApp)
	}
	return filteredApps, nil
}

func (inst *App) getReleaseVersion(assistClient *assistcli.Client, hostUUID string) (*string, error) {
	var releaseVersion string
	appStatus, connectionErr, requestErr := assistClient.EdgeAppStatus(hostUUID, constants.FlowFramework)
	if connectionErr != nil {
		return nil, connectionErr
	}
	if requestErr != nil {
		inst.uiWarningMessage(requestErr)
	}
	if appStatus != nil {
		releaseVersion = appStatus.Version
	} else {
		release, err := inst.getLatestReleaseVersion()
		if err != nil {
			return nil, err
		}
		releaseVersion = release
	}
	return &releaseVersion, nil
}

func (inst *App) FakeEdgeAppsInfoModelCreationOnUI() *rumodel.EdgeAppsInfo { // this is just for frontend
	return nil
}
