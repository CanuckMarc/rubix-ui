package backend

import (
	"fmt"
	"github.com/NubeDev/flow-eng/helpers/str"
	"github.com/NubeIO/git/pkg/git"
)

func (inst *App) ListIO16Releases() []string {
	opts := &git.AssetOptions{
		Owner: "NubeIO",
		Repo:  "rubix-io-fw",
	}
	pageOpts := &git.ListOptions{
		Page:    0,
		PerPage: 0,
	}
	token, err := inst.DB.GetGitToken(false)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	resp, err := inst.appStore.ListReleases(opts, token, pageOpts)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	var out []string
	for _, release := range resp {
		if release.TagName != nil {
			out = append(out, str.NonNil(release.TagName))
		}
	}
	return out
}

func (inst *App) DownloadIO16Firmware(version string) string {
	token, err := inst.DB.GetGitToken(false)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return ""
	}
	resp, err := inst.appStore.DownloadIO16Firmware(token, version)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return ""
	}
	return resp
}

func (inst *App) ListIO16Builds() []string {
	resp, err := inst.appStore.ListIO16Builds()
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) ListIO16BuildFiles(version string, includeDebug bool) []string {
	resp, err := inst.appStore.ListIO16BuildFiles(version, includeDebug)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
		return nil
	}
	return resp
}

func (inst *App) FlashIO16(version string) string {

	return ""
}
