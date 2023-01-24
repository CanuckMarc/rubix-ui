package backend

func (inst *App) ConfigureOpenVPN(connUUID, hostUUID string) bool {
	client, err := inst.getAssistClient(&AssistClient{ConnUUID: connUUID})
	if err != nil {
		return false
	}
	host, err := inst.getHost(connUUID, hostUUID)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	msg, err := client.ConfigureOpenVPN(host.UUID)
	if err != nil {
		inst.uiErrorMessage(err)
		return false
	}
	inst.uiSuccessMessage(msg.Message)
	return true
}
