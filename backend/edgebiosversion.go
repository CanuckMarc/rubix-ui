package backend

import (
	"context"
	"fmt"
	"github.com/NubeIO/git/pkg/git"
	"github.com/NubeIO/rubix-assist/service/clients/edgebioscli/ebmodel"
	"github.com/NubeIO/rubix-ui/backend/constants"
	"github.com/google/go-github/v32/github"
	"golang.org/x/oauth2"
)

func (inst *App) EdgeBiosRubixEdgeVersions() []string {
	const owner = "NubeIO"
	const repo = "rubix-edge"
	return inst.getRepoVersions(owner, repo)
}

func (inst *App) getRepoVersions(owner string, repo string) []string {
	token, err := inst.GetGitToken(constants.SettingUUID, false)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("failed to get git token %s", err.Error()))
		return make([]string, 0)
	}
	c := context.Background()
	tokenSource := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	)
	githubClient := github.NewClient(oauth2.NewClient(c, tokenSource))

	releases, _, err := githubClient.Repositories.ListReleases(c, owner, repo, &git.ListOptions{Page: 1, PerPage: 100})
	if err != nil {
		inst.uiErrorMessage(err)
		return make([]string, 0)
	}
	releaseOutput := make([]string, 0)
	for _, release := range releases {
		releaseOutput = append(releaseOutput, *release.TagName)
	}
	return releaseOutput
}

func (inst *App) EdgeBiosInstalledRubixEdgeVersion(connUUID, hostUUID string) *ebmodel.Version {
	version, err := inst.edgeBiosInstalledRubixEdgeVersion(connUUID, hostUUID)
	if err != nil {
		inst.uiErrorMessage(fmt.Sprintf("error %s", err.Error()))
	}
	return version
}

func (inst *App) edgeBiosInstalledRubixEdgeVersion(connUUID, hostUUID string) (*ebmodel.Version, error) {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return nil, err
	}
	return client.EdgeBiosRubixEdgeVersion(hostUUID)
}
