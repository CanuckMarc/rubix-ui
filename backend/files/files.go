package files

import (
	"bytes"
	"encoding/json"
	"fmt"
	fileutils "github.com/NubeIO/lib-dirs/dirs"
	"io/ioutil"
	"os"
	"path/filepath"
)

const dirPath = "/rubix"

var buildsPath = fmt.Sprintf("%s/%s", dirPath, "builds")
var backupsPath = fmt.Sprintf("%s/%s", dirPath, "backups")
var pluginsPath = fmt.Sprintf("%s/%s", dirPath, "plugins")

type Files struct {
}

func New() *Files {
	return &Files{}
}

func writeDataToFileAsJSON(data interface{}, filedir string) (int, error) {
	//write data as buffer to json encoder
	buffer := new(bytes.Buffer)
	encoder := json.NewEncoder(buffer)
	encoder.SetIndent("", "\t")

	err := encoder.Encode(data)
	if err != nil {
		return 0, err
	}
	file, err := os.OpenFile(filedir, os.O_RDWR|os.O_CREATE|os.O_WRONLY, 0666)

	if err != nil {
		return 0, err
	}
	n, err := file.Write(buffer.Bytes())
	if err != nil {
		return 0, err
	}
	return n, nil
}

func (inst *Files) WriteBackupFile(data interface{}, file string) (int, error) {
	home, err := fileutils.HomeDir()
	if err != nil {
		return 0, err
	}
	localSystemFilePath := filepath.FromSlash(fmt.Sprintf("%s/%s/%s", home, backupsPath, file))
	return writeDataToFileAsJSON(data, localSystemFilePath)
}

func (inst *Files) GetBackUpFile(file string) (interface{}, error) {
	home, err := fileutils.HomeDir()
	if err != nil {
		return nil, err
	}
	localSystemFilePath := filepath.FromSlash(fmt.Sprintf("%s/%s/%s", home, backupsPath, file))
	plan, err := ioutil.ReadFile(localSystemFilePath)
	if err != nil {
		return nil, err
	}
	var data interface{}
	err = json.Unmarshal(plan, &data)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (inst *Files) readFiles(path string) ([]string, error) {
	home, err := fileutils.HomeDir()
	if err != nil {
		return nil, err
	}
	localSystemFilePath := filepath.FromSlash(fmt.Sprintf("%s/%s", home, path))
	fileInfo, err := os.Stat(localSystemFilePath)
	if err != nil {
		return nil, err
	}
	var dirContent []string
	if fileInfo.IsDir() {
		files, err := ioutil.ReadDir(localSystemFilePath)
		if err != nil {
			return nil, err
		}
		for _, file := range files {
			dirContent = append(dirContent, file.Name())
		}
	}
	return dirContent, nil
}
