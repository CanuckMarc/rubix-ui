package backend

import (
	"context"
	"errors"
	"fmt"
	"github.com/NubeDev/flow-eng/helpers/boolean"
	"github.com/NubeIO/rubix-assist/service/clients/assistcli"
	"github.com/NubeIO/rubix-ui/backend/storage"
	"github.com/NubeIO/rubix-ui/backend/store"
	log "github.com/sirupsen/logrus"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"os/exec"
	"runtime"
)

const gitToken = "set_123456789ABC"
const eth0 = "eth0"
const eth1 = "eth1"
const RubixCompute = "RubixCompute"
const RubixCompute5 = "RubixCompute5"
const RubixComputeIO = "RubixComputeIO"
const Cloud = "Cloud"
const configEnv = ".env"
const configYml = "config.yml"
const bacnetServerDriver = "bacnet-server-driver"
const bacnetMasterDriver = "bacnet-master-driver"
const flowFramework = "flow-framework"
const rubixWires = "rubix-wires"

func (inst *App) errMsg(err error) error {
	if err != nil {
		inst.crudMessage(false, fmt.Sprintf("error %s", err.Error()))
		return err
	}
	return nil
}

// App struct
type App struct {
	ctx   context.Context
	DB    storage.Storage
	store *store.Store
}

// NewApp creates a new App application struct
func NewApp() *App {
	app := &App{}
	app.DB = storage.New("")
	appStore, err := store.New(&store.Store{})
	if err != nil {
		log.Fatalf("init store on start of app err: %s", err.Error())
	}
	app.store = appStore
	return app
}

// OnStartup is called when the app starts. The context is saved, so we can call the runtime methods
func (inst *App) OnStartup(ctx context.Context) {
	inst.ctx = ctx
}

func (inst *App) OnReload() {
	wailsruntime.WindowReloadApp(inst.ctx)
}

func (inst *App) OnQuit() {
	wailsruntime.Quit(inst.ctx)
}

func (inst *App) NubeHelp() {
	url := "https://desk.zoho.com.au/portal/nubeio/en/home"
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
	var err error
	if body.ConnUUID == "" {
		err = inst.errMsg(err)
		return nil, errors.New("conn can not be empty")
	}
	connection := &storage.RubixConnection{}
	if matchConnectionUUID(body.ConnUUID) {
		connection, err = inst.DB.Select(body.ConnUUID)
		if err != nil {
			err = inst.errMsg(err)
			return nil, err
		}
	} else {
		connection, err = inst.DB.SelectByName(body.ConnUUID)
		if err != nil {
			err = inst.errMsg(err)
			return nil, err
		}
	}
	if connection == nil {
		err = inst.errMsg(errors.New("failed to find a connection"))
		return nil, errors.New("failed to find a connection")
	}
	cli := assistcli.New(&assistcli.Client{
		Ip:            connection.IP,
		Port:          connection.Port,
		HTTPS:         boolean.NewFalse(),
		ExternalToken: connection.AssistToken,
	})
	return cli, nil
}

type AssistClient struct {
	ConnUUID string
}