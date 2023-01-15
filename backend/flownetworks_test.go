package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/nils"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_addFlowNetwork(t *testing.T) {
	app := MockNewApp()
	body := &model.FlowNetwork{
		CommonFlowNetwork: model.CommonFlowNetwork{
			IsRemote:    nils.NewTrue(),
			FlowHTTPS:   nil,
			FlowToken:   nils.NewString("$2a$10$PtoJ.0jSD90NgTy/t20nK.NkEMF1oPBeo4p1CL9fFy7hdTdF1jjcW"),
			IsTokenAuth: nils.NewTrue(),
		},

		FlowIP:         nils.NewString("192.168.15.153"),
		FlowPort:       nils.NewInt(1660),
		FlowTokenLocal: nils.NewString("$2a$10$PtoJ.0jSD90NgTy/t20nK.NkEMF1oPBeo4p1CL9fFy7hdTdF1jjcW"),
	}
	bulk, err := app.addFlowNetwork("cloud", "rc", body)
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(bulk)

}
