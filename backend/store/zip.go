package store

import (
	"github.com/NubeIO/lib-files/fileutils"
	"os"
)

func (inst *AppStore) Unzip(source, destination string, perm os.FileMode) ([]fileutils.FileDetails, error) {
	return fileutils.Unzip(source, destination, perm)
}
