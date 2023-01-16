package json2csv

import (
	"encoding/json"
	"fmt"
	"github.com/nqd/flat"
	log "github.com/sirupsen/logrus"
	"github.com/xuri/excelize/v2"
	"sort"
)

// JsonToExcel converter
func JsonToExcel(byteValue []byte, excelLocation, sheetName string, header []string, customHeader, sortHeader bool) error {
	var err error

	var jsonMaps []map[string]interface{}
	err = json.Unmarshal(byteValue, &jsonMaps)
	if err != nil {
		log.Error(err)
		return err
	}

	var jsonNormalized []map[string]interface{}
	var jsonFirst map[string]interface{}
	jsonNormalized = bulkNormalize(jsonMaps)
	if len(jsonNormalized) == 0 {
		return err
	}
	if customHeader {
		jsonFirst = jsonNormalized[0]
	}

	f := excelize.NewFile()
	sheetIndex, _ := f.GetSheetIndex(sheetName)

	// Header
	var headerKeys []string
	for k := range jsonFirst {
		headerKeys = append(headerKeys, k)
	}

	if customHeader {
		headerKeys = header
	}
	if sortHeader {
		sort.Strings(headerKeys)
	}
	columnHeaderCount := 1
	for _, k := range headerKeys {
		f.SetCellValue(sheetName, fmt.Sprintf("%s1", getColumnName(columnHeaderCount)), k)
		columnHeaderCount += 1
	}
	rowCount := 2
	for _, jsonData := range jsonNormalized {
		columnCount := 1
		for _, k := range headerKeys {
			f.SetCellValue(sheetName, fmt.Sprintf("%s%v", getColumnName(columnCount), rowCount), jsonData[k])
			columnCount += 1
		}
		rowCount += 1
	}

	// Set active sheet of the workbook.
	f.SetActiveSheet(sheetIndex)

	if err := f.SaveAs(excelLocation); err != nil {
		log.Fatal(err)
	}

	log.Infof("success saved at %s", excelLocation)
	return nil
}

// bulkNormalize returns a bulkNormalize
func bulkNormalize(jsonMaps []map[string]interface{}) (res []map[string]interface{}) {
	for _, jsonMap := range jsonMaps {
		out, err := flat.Flatten(jsonMap, nil)
		if err != nil {
			return res
		}

		res = append(res, out)
	}
	return res
}

// getColumnName excel
func getColumnName(col int) string {
	name := make([]byte, 0, 3) // max 16,384 columns (2022)
	const aLen = 'Z' - 'A' + 1 // alphabet length
	for ; col > 0; col /= aLen + 1 {
		name = append(name, byte('A'+(col-1)%aLen))
	}
	for i, j := 0, len(name)-1; i < j; i, j = i+1, j-1 {
		name[i], name[j] = name[j], name[i]
	}
	return string(name)
}
