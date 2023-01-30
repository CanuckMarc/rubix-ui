package backend

import (
	"fmt"
	"github.com/NubeIO/nubeio-rubix-lib-helpers-go/pkg/nils"
	"github.com/NubeIO/nubeio-rubix-lib-models-go/pkg/v1/model"
	pprint "github.com/NubeIO/rubix-ui/backend/helpers/print"
	"testing"
)

func TestApp_WritePointValue(t *testing.T) {
	app := MockNewApp()

	body := &model.Priority{
		PointUUID: "pnt_95ff1f8005174dca",
		P1:        nil,
		P2:        nil,
		P3:        nil,
		P4:        nil,
		P5:        nil,
		P6:        nil,
		P7:        nil,
		P8:        nil,
		P9:        nil,
		P10:       nil,
		P11:       nil,
		P12:       nil,
		P13:       nil,
		P14:       nil,
		P15:       nil,
		P16:       nils.NewFloat64(22),
	}

	value, err := app.writePointValue("cloud", "rc", "pnt_95ff1f8005174dca", body)
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(value)

}
func TestApp_getPointListPayload(t *testing.T) {
	app := MockNewApp()

	value, err := app.getPointListPayload("cloud", "rc")
	fmt.Println(err)
	if err != nil {
		return
	}
	pprint.PrintJOSN(value)

}
