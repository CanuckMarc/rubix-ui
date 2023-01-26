package rumodel

type InstalledApps struct {
	AppName           string `json:"app_name,omitempty"`
	Version           string `json:"version,omitempty"`
	MinVersion        string `json:"min_version,omitempty"`
	MaxVersion        string `json:"max_version,omitempty"`
	ServiceName       string `json:"service_name,omitempty"`
	IsInstalled       bool   `json:"is_installed"`
	Message           string `json:"message,omitempty"`
	Match             bool   `json:"match,omitempty"`
	DowngradeRequired bool   `json:"downgrade_required,omitempty"`
	UpgradeRequired   bool   `json:"upgrade_required,omitempty"`
	State             string `json:"state,omitempty"`
	ActiveState       string `json:"active_state,omitempty"`
	SubState          string `json:"sub_state,omitempty"`
}

type AppsAvailableForInstall struct {
	AppName    string `json:"app_name,omitempty"`
	MinVersion string `json:"min_version,omitempty"`
	MaxVersion string `json:"max_version,omitempty"`
}

type RunningServices struct {
	Name        string `json:"name,omitempty"`
	State       string `json:"state,omitempty"`
	ActiveState string `json:"active_state,omitempty"`
	SubState    string `json:"sub_state,omitempty"`
}

type EdgeAppsInfo struct {
	InstalledApps           []InstalledApps           `json:"installed_apps"`
	AppsAvailableForInstall []AppsAvailableForInstall `json:"apps_available_for_install"`
	RunningServices         []RunningServices         `json:"running_services"`
}
