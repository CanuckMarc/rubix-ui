package backend

func (inst *App) ListIO16Builds() ([]string, error) {
	return inst.appStore.ListIO16Builds()
}
