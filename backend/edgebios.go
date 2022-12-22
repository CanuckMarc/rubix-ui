package backend

import (
	"fmt"
	"github.com/NubeIO/rubix-assist/amodel"
	"github.com/NubeIO/rubix-ui/backend/store"
	log "github.com/sirupsen/logrus"
)

func (inst *App) EdgeBiosRubixEdgeInstall(connUUID, hostUUID, version string) *string {
	err := inst.edgeBiosRubixEdgeInstall(connUUID, hostUUID, version)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
	}
	return nil
}

func (inst *App) edgeBiosRubixEdgeInstall(connUUID, hostUUID, version string) error {
	const appName = "rubix-edge"
	const lastStep = "5"
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return err
	}
	arch, err := client.EdgeBiosArch(hostUUID)
	inst.uiSuccessMessage(fmt.Sprintf("(step 1 of %s) got edge device details: %s", lastStep, arch.Arch))
	if err != nil {
		return err
	}

	token, err := inst.DB.GetGitToken(false)
	app := store.App{
		Name:    appName,
		Version: version,
		Arch:    arch.Arch,
	}
	err = inst.appStore.StoreCheckAppAndVersionExists(app)
	if err != nil {
		inst.uiSuccessMessage(fmt.Sprintf("(step 2 of %s) downloaded rubix-edge to local coz it doesn't exist",
			lastStep))
		log.Info(fmt.Sprintf("app: %s not found in appStore so download", appName))
		if _, err = inst.appStore.GitDownloadZip(token, app, false, false); err != nil {
			return err
		}
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("(step 2 of %s) rubix-edge already exists", lastStep))
	}

	assistClient, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		log.Info(err.Error())
		return err
	}

	_, skip, err := inst.assistAddUploadApp(assistClient, app, true)
	if err != nil {
		log.Errorf(fmt.Sprintf("(step 3 of %s) failed to upload rubix-edge to rubix-assist server", lastStep))
	}
	if skip {
		inst.uiSuccessMessage(fmt.Sprintf("(step 3 of %s) rubix-edge already exists on rubix-assist server", lastStep))
	} else {
		inst.uiSuccessMessage(fmt.Sprintf("(step 3 of %s) uploaded rubix-edge to rubix-assist server", lastStep))
	}

	_, err = assistClient.EdgeBiosRubixEdgeUpload(hostUUID, amodel.FileUpload{Arch: arch.Arch, Version: version})
	if err != nil {
		log.Errorf(fmt.Sprintf("(step 4 of %s) failed to upload rubix-edge to edge device", lastStep))
		return err
	}
	inst.uiSuccessMessage(fmt.Sprintf("(step 4 of %s) uploaded rubix-edge to edge device", lastStep))
	_, err = assistClient.EdgeBiosRubixEdgeInstall(hostUUID, amodel.FileUpload{Arch: arch.Arch, Version: version})
	if err != nil {
		log.Errorf(fmt.Sprintf("(step 5 of %s) failed to install rubix-edge to edge device", lastStep))
		return err
	}
	inst.uiSuccessMessage(fmt.Sprintf("(step 5 of %s) installed rubix-edge to edge device", lastStep))
	return nil
}
