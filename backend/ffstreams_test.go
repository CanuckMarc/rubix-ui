package backend

import (
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_AddStream(t *testing.T) {
	app := MockNewApp()
	body := &model.Stream{
		CommonStream: model.CommonStream{},
	}
	bulk := app.AddStream("cloud", "hos_DABC722D420A", "flw_DABC722D420A", body)
	pprint.PrintJOSN(bulk)

}
