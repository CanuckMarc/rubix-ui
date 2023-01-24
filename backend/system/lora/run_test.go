package lora

import "testing"

func TestInstance_run(t *testing.T) {
	s := New(&Instance{})
	s.Run()

}
