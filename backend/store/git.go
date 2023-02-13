package store

import (
	"context"
	"errors"
	"github.com/NubeIO/git/pkg/git"
	log "github.com/sirupsen/logrus"
	"path"
)

func intPtrToInt(b *int64) int64 {
	if b == nil {
		return 0
	} else {
		return *b
	}
}

func stringPtrToString(b *string) string {
	if b == nil {
		return ""
	} else {
		return *b
	}
}

func (inst *AppStore) ListReleases(repo *git.AssetOptions, token string, pageOpts *git.ListOptions) ([]*git.RepositoryRelease, error) {
	ctx := context.Background()
	gitClient := git.NewClient(token, repo, ctx)
	return gitClient.ListReleases(pageOpts)
}

func (inst *AppStore) gitDownloadZipball(app App, token string, gitOptions git.DownloadOptions) (*string, error) {
	opts := &git.AssetOptions{
		Owner: inst.Store.Owner,
		Repo:  app.Repo,
		Tag:   app.Version,
		Arch:  app.Arch,
	}
	ctx := context.Background()
	gitClient := git.NewClient(token, opts, ctx)
	download, err := gitClient.DownloadZipball(gitOptions)
	if err != nil {
		return nil, err
	}
	assetName := download.AssetName
	log.Infof("git downloaded assest: %s", assetName)
	return &assetName, err
}

func (inst *AppStore) gitDownloadAsset(app App, token string, gitOptions git.DownloadOptions) (*string, error) {
	if token == "" {
		return nil, errors.New("git token can not be empty")
	}
	opts := &git.AssetOptions{
		Owner: inst.Store.Owner,
		Repo:  app.Repo,
		Tag:   app.Version,
		Arch:  app.Arch,
	}
	ctx := context.Background()
	gitClient := git.NewClient(token, opts, ctx)
	releaseAsset, err := gitClient.GetReleaseAsset(gitOptions)
	if err != nil {
		return nil, err
	}
	if releaseAsset == nil {
		return nil, errors.New("release asset is empty")
	}
	assetName := stringPtrToString(releaseAsset.Name)
	destination := path.Join(gitOptions.DownloadDestination, assetName)
	err = gitClient.DownloadReleaseAsset(opts.Owner, opts.Repo, destination, intPtrToInt(releaseAsset.ID))
	if err != nil {
		return nil, err
	}

	log.Infof("git downloaded assest: %s", assetName)
	return &assetName, err
}
