package ttime

import (
	"github.com/rvflash/elapsed"
	"time"
)

// TimeSince returns in a human readable format the elapsed time
// eg 12 hours, 12 days
func TimeSince(t time.Time) string {
	return elapsed.Time(t)
}
