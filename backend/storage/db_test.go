package storage

import (
	"fmt"
	"os"
	"testing"
)

func TestInitializeBuntDB(t *testing.T) {
	dbFile := "test.db"
	db := New(dbFile)
	add, err := db.Add(&RubixConnection{
		Name:        "test",
		Description: "test",
	})
	fmt.Println(err, add)
	if err != nil {
		return
	}
	all, err := db.SelectAll()
	if err != nil {
		return
	}

	last := RubixConnection{}

	for i, toggle := range all {
		fmt.Println(i, toggle)
		last = toggle
	}

	toggle, err := db.Select(last.UUID)
	if err != nil {
		return
	}
	db.Wipe()
	os.Remove(dbFile)

	fmt.Println(toggle.Description)

}
