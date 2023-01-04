package message

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"strings"
)

type BusTopic string

const (
	OkMsg   BusTopic = "ok"
	WarnMsg BusTopic = "warn"
	ErrMsg  BusTopic = "err"
)

func UiSuccessMessage(ctx context.Context, data interface{}) {
	message := fmt.Sprintf("%s", data)
	log.Infof(message)
	msgToUI(ctx, string(OkMsg), message)
}

func UiWarningMessage(ctx context.Context, data interface{}) {
	message := fmt.Sprintf("%s", data)
	log.Warnf(message)
	msgToUI(ctx, string(WarnMsg), message)
}

func UiErrorMessage(ctx context.Context, data interface{}) {
	message := fmt.Sprintf("%s", data)
	log.Errorf(message)
	if gitTokenError(data) != "" {
		msgToUI(ctx, string(ErrMsg), gitTokenError(data))
		return
	}
	msgToUI(ctx, string(ErrMsg), message)

}

func msgToUI(ctx context.Context, topic string, data interface{}) {
	if ctx != nil {
		runtime.EventsEmit(ctx, topic, data)
	}
}

func MsgFromUI(ctx context.Context) {
	if ctx != nil {
		runtime.EventsOn(ctx, "terminal-echo", func(optionalData ...interface{}) {
			fmt.Println("Event from UI to backend data: ", optionalData)
		})
	}
}

func gitTokenError(data interface{}) string {
	if strings.Contains(fmt.Sprint(data), "401 Bad credentials []") {
		return "please check/add github token in settings (contact nube support for a token)"
	}
	return ""
}
