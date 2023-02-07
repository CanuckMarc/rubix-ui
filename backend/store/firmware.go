package store

import (
	"github.com/NubeIO/lib-files/fileutils"
	"path"
	"strings"
)

func (inst *AppStore) ListIO16Builds() ([]string, error) {
	var out []string
	files, err := fileutils.ListFiles(inst.Store.IO16FirmwareDir)
	if err != nil {
		return out, err
	}
	for _, file := range files {
		if !strings.Contains(file, ".zip") {
			out = append(out, file)
		}
	}
	return out, nil
}

// ListIO16BuildFiles pass in version R-IO-Modbus-v3.2
func (inst *AppStore) ListIO16BuildFiles(version string, includeDebug bool) ([]string, error) {
	var out []string
	buildPath := path.Join(inst.Store.IO16FirmwareDir, version)
	buildPath = path.Join(buildPath, "BUILDS")
	files, err := fileutils.ListFiles(buildPath)
	if err != nil {
		return out, err
	}
	if includeDebug {
		return files, err
	}
	for _, file := range files {
		if !strings.Contains(file, "DEBUG") {
			out = append(out, file)
		}
	}
	return out, nil
}
