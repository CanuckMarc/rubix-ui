package backend

import (
	"github.com/NubeIO/rubix-ui/backend/rumodel"
	"github.com/NubeIO/rubix-ui/backend/storage"
)

func (inst *App) GetSettings() *rumodel.Response {
	out, err := inst.DB.GetSettings()
	if err != nil {
		return inst.fail(err)
	}
	return inst.successResponse(out)
}

func (inst *App) UpdateSettings(body *storage.Settings) *rumodel.Response {
	out, err := inst.DB.UpdateSettings(body)
	if err != nil {
		return inst.fail(err)
	}
	return inst.successResponse(out)
}

func (inst *App) GetGitToken() *rumodel.Response {
	out, err := inst.DB.GetGitToken(true)
	if err != nil {
		return inst.fail(err)
	}
	return inst.successResponse(out)
}

func (inst *App) SetGitToken(token string) *rumodel.Response {
	out, err := inst.DB.SetGitToken(token)
	if err != nil {
		return inst.fail(err)
	}
	return inst.successResponse(out)
}
