module github.com/NubeIO/rubix-ui

go 1.17

//replace github.com/NubeIO/rubix-assist => /home/aidan/code/go/nube/rubix-assist
//replace github.com/NubeIO/lib-schema => /home/aidan/code/go/nube/lib/lib-schema
//replace github.com/NubeIO/lib-rubix-installer => /home/aidan/code/go/nube/lib/lib-rubix-installer

require (
	github.com/NubeIO/git v0.0.6
	github.com/NubeIO/lib-date v0.0.6
	github.com/NubeIO/lib-dhcpd v0.0.2
	github.com/NubeIO/lib-dirs v0.0.8
	github.com/NubeIO/lib-networking v0.0.7
	github.com/NubeIO/lib-rubix-installer v0.2.2
	github.com/NubeIO/lib-schema v0.1.4
	github.com/NubeIO/lib-systemctl-go v0.1.2
	github.com/NubeIO/lib-uuid v0.0.3
	github.com/NubeIO/nubeio-rubix-lib-auth-go v1.0.3
	github.com/NubeIO/nubeio-rubix-lib-helpers-go v0.2.7
	github.com/NubeIO/nubeio-rubix-lib-models-go v1.3.4
	github.com/NubeIO/rubix-assist v0.4.9
	github.com/NubeIO/rubix-edge v0.2.0
	github.com/google/go-github/v32 v32.1.0
	github.com/hashicorp/go-version v1.6.0
	github.com/iancoleman/strcase v0.2.0
	github.com/manifoldco/promptui v0.9.0
	github.com/na4ma4/config v1.0.0
	github.com/sirupsen/logrus v1.9.0
	github.com/spf13/cobra v1.4.0
	github.com/spf13/viper v1.12.0
	github.com/stretchr/objx v0.4.0
	github.com/tidwall/buntdb v1.2.9
	github.com/tidwall/gjson v1.12.1
	github.com/wailsapp/wails/v2 v2.0.0-beta.39.2
	go.uber.org/zap v1.21.0
	golang.org/x/crypto v0.0.0-20220525230936-793ad666bf5e
	gopkg.in/yaml.v3 v3.0.1
)

require (
	github.com/NubeIO/lib-command v0.0.2 // indirect
	github.com/NubeIO/lib-files v0.1.1 // indirect
	github.com/NubeIO/lib-ufw v0.0.3 // indirect
	github.com/bep/debounce v1.2.1 // indirect
	github.com/chzyer/readline v0.0.0-20180603132655-2972be24d48e // indirect
	github.com/fsnotify/fsnotify v1.5.4 // indirect
	github.com/go-ole/go-ole v1.2.6 // indirect
	github.com/go-resty/resty/v2 v2.7.0 // indirect
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/hashicorp/hcl v1.0.0 // indirect
	github.com/imdario/mergo v0.3.12 // indirect
	github.com/inconshreveable/mousetrap v1.0.0 // indirect
	github.com/jchv/go-winloader v0.0.0-20210711035445-715c2860da7e // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/labstack/echo/v4 v4.7.2 // indirect
	github.com/labstack/gommon v0.3.1 // indirect
	github.com/leaanthony/go-ansi-parser v1.0.1 // indirect
	github.com/leaanthony/gosod v1.0.3 // indirect
	github.com/leaanthony/slicer v1.5.0 // indirect
	github.com/magiconair/properties v1.8.6 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/mitchellh/mapstructure v1.5.0 // indirect
	github.com/pelletier/go-toml v1.9.5 // indirect
	github.com/pelletier/go-toml/v2 v2.0.2 // indirect
	github.com/pkg/browser v0.0.0-20210706143420-7d21f8c997e2 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/rogpeppe/go-internal v1.8.0 // indirect
	github.com/sergeymakinen/go-systemdconf/v2 v2.0.2 // indirect
	github.com/spf13/afero v1.8.2 // indirect
	github.com/spf13/cast v1.5.0 // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/subosito/gotenv v1.4.0 // indirect
	github.com/tidwall/btree v1.1.0 // indirect
	github.com/tidwall/grect v0.1.4 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.0 // indirect
	github.com/tidwall/rtred v0.1.2 // indirect
	github.com/tidwall/tinyqueue v0.1.1 // indirect
	github.com/tkrajina/go-reflector v0.5.5 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	github.com/wailsapp/mimetype v1.4.1 // indirect
	go.uber.org/atomic v1.9.0 // indirect
	go.uber.org/multierr v1.8.0 // indirect
	golang.org/x/net v0.0.0-20220607020251-c690dde0001d // indirect
	golang.org/x/oauth2 v0.0.0-20220411215720-9780585627b5 // indirect
	golang.org/x/sys v0.0.0-20220715151400-c0bba94af5f8 // indirect
	golang.org/x/text v0.3.7 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/protobuf v1.28.0 // indirect
	gopkg.in/check.v1 v1.0.0-20201130134442-10cb98267c6c // indirect
	gopkg.in/ini.v1 v1.66.6 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gorm.io/datatypes v1.0.6 // indirect
	gorm.io/driver/mysql v1.3.2 // indirect
	gorm.io/gorm v1.23.5 // indirect
)
