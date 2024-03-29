package backend

import (
	"context"
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-ui/backend/assistcli"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/store"
	log "github.com/sirupsen/logrus"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"os/exec"
	"path/filepath"
	"runtime"
)

func (inst *App) errMsg(err error) error {
	if err != nil {
		inst.uiErrorMessage(err.Error())
		return err
	}
	return nil
}

type App struct {
	ctx                        context.Context
	DB                         storage.IStorage
	appStore                   store.IAppStore
	LatestReleaseVersion       string
	LatestRubixEdgeVersion     string
	LatestRubixAssistVersion   string
	LatestFlowFrameworkVersion string
}

type AssistClient struct {
	ConnUUID string
}

func NewApp() *App {
	app := &App{}
	app.DB = storage.New("")
	appStore, err := store.New(&store.Store{})
	if err != nil {
		log.Fatalf("init appStore on start of app err: %s", err.Error())
	}
	app.appStore = appStore
	return app
}

func (inst *App) getLatestVersions() {
	token, err := inst.DB.GetGitToken(false)
	if err != nil {
		log.Errorf("failed to get git token")
		return
	}
	if token == "" {
		log.Errorf("please contact nube support for a git token")
		return
	}
	edgeVersions := inst.EdgeBiosRubixEdgeVersions()
	if len(edgeVersions) > 0 {
		inst.LatestRubixEdgeVersion = edgeVersions[0]
	} else {
		// assume the token was bad to don't try and get the other versions of assist and FF
		return
	}

	listReleases := inst.GitListReleases(token)
	if len(listReleases) > 0 {
		inst.LatestReleaseVersion = listReleases[len(listReleases)-1].Name
	}
	assistVersions := inst.EdgeBiosRubixAssistVersions()
	if len(assistVersions) > 0 {
		inst.LatestRubixAssistVersion = assistVersions[0]
	}

	flowVersions := inst.EdgeFlowFrameworkVersions()
	if len(assistVersions) > 0 {
		inst.LatestFlowFrameworkVersion = flowVersions[0]
	}

	version, err := inst.getLatestReleaseVersion()
	if err != nil {
		return
	}

	if version != inst.LatestReleaseVersion {
		log.Infof("a new release is available so re-sync: %s", inst.LatestRubixEdgeVersion)
		inst.GitDownloadReleases()
	}

	log.Infof("latest rubix-edge version: %s", inst.LatestRubixEdgeVersion)
	log.Infof("latest rubix-assist version: %s", inst.LatestRubixAssistVersion)
	log.Infof("latest release version: %s", inst.LatestReleaseVersion)
	log.Infof("latest flow-framework version: %s", inst.LatestFlowFrameworkVersion)
}

// OnStartup is called when the app starts. The context is saved, so we can call the runtime methods
func (inst *App) OnStartup(ctx context.Context) {
	inst.ctx = ctx
	go inst.getLatestVersions()
}

func (inst *App) OnReload() {
	wailsruntime.WindowReloadApp(inst.ctx)
}

func (inst *App) OnQuit() {
	wailsruntime.Quit(inst.ctx)
}

func (inst *App) NewTab(workingDir string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		cmd := exec.Command("./rubix-ui")
		cmd.Dir = workingDir
		err := cmd.Run()
		fmt.Println(err)
	case "windows":
		cmdStrings := `.\rubix-ui.exe`
		cmd := exec.Command(cmdStrings)
		cmd.Dir = filepath.FromSlash(workingDir)
		err := cmd.Run()
		fmt.Println(err)
	case "darwin":
		err = fmt.Errorf("unsupported platform")
		log.Error(err)
	default:
		err = fmt.Errorf("unsupported platform")
		log.Error(err)
	}
}

func (inst *App) NubeHelp() {
	url := "https://nubeio.zohodesk.com.au/portal/en/kb/nube-io/software/rubix-platform-ce"
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("cmd", "/c", "start", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
		fmt.Println(err)
	}
}

func matchConnectionUUID(uuid string) bool {
	if len(uuid) == 16 {
		if uuid[0:4] == "con_" {
			return true
		}
	}
	return false
}

func (inst *App) getAssistClient(body *AssistClient) (*assistcli.Client, error) {
	if body.ConnUUID == "" {
		return nil, errors.New("connection.uuid can not be empty")
	}
	connection, err := inst.getRubixAssistConnection(body.ConnUUID)
	if err != nil {
		return nil, err
	}
	client := &assistcli.Client{
		Ip:            connection.IP,
		Port:          connection.Port,
		HTTPS:         connection.HTTPS,
		ExternalToken: connection.ExternalToken,
	}
	cli := assistcli.New(client)
	if cli != nil {
		return cli, nil
	} else {
		return nil, errors.New("error on creating assist client cli")
	}
}

func (inst *App) forceGetAssistClient(uuid string) (*assistcli.Client, error) {
	connection, err := inst.getRubixAssistConnection(uuid)
	if err != nil {
		return nil, err
	}
	client := &assistcli.Client{
		Ip:            connection.IP,
		Port:          connection.Port,
		HTTPS:         connection.HTTPS,
		ExternalToken: connection.ExternalToken,
	}
	cli := assistcli.ForceNew(client)
	if cli != nil {
		return cli, nil
	} else {
		return nil, errors.New("error on creating assist client cli")
	}
}

func (inst *App) getRubixAssistConnection(connectionUuid string) (*storage.RubixConnection, error) {
	if matchConnectionUUID(connectionUuid) {
		connection, err := inst.DB.Select(connectionUuid)
		if err != nil {
			err = inst.errMsg(err)
			return nil, err
		}
		return connection, nil
	} else {
		connection, err := inst.DB.SelectByName(connectionUuid)
		if err != nil {
			err = inst.errMsg(err)
			return nil, err
		}
		return connection, nil
	}
}
