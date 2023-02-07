package assistcli

import (
	"fmt"
	"sync"

	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
)

var (
	mutex   = &sync.RWMutex{}
	clients = map[string]*Client{}
)

type Client struct {
	Rest          *resty.Client
	Ip            string `json:"ip"`
	Port          int    `json:"port"`
	HTTPS         bool   `json:"https"`
	ExternalToken string `json:"external_token"`
}

type ResponseBody struct {
	Response ResponseCommon `json:"response"`
	Status   string         `json:"status"`
	Count    string         `json:"count"`
}

type ResponseCommon struct {
	UUID string `json:"uuid"`
}

func buildUrl(overrideUrl ...string) string {
	if len(overrideUrl) > 0 {
		if overrideUrl[0] != "" {
			return overrideUrl[0]
		}
	}
	return ""
}

func New(cli *Client) *Client {
	mutex.Lock()
	defer mutex.Unlock()
	if cli == nil {
		log.Fatal("assist client cli can not be empty")
		return nil
	}
	baseURL := getBaseUrl(cli)
	if client, found := clients[baseURL]; found {
		return client
	}
	cli.Rest = resty.New()
	cli.Rest.SetBaseURL(baseURL)
	cli.SetTokenHeader(cli.ExternalToken)
	clients[baseURL] = cli
	return cli
}

func ForceNew(cli *Client) *Client {
	mutex.Lock()
	defer mutex.Unlock()
	if cli == nil {
		log.Fatal("assist client cli can not be empty")
		return nil
	}
	cli.Rest = resty.New()
	baseURL := getBaseUrl(cli)
	cli.Rest.SetBaseURL(baseURL)
	cli.SetTokenHeader(cli.ExternalToken)
	clients[baseURL] = cli
	return cli
}

func getBaseUrl(cli *Client) string {
	if cli.Ip == "" {
		cli.Ip = "0.0.0.0"
	}
	if cli.Port == 0 {
		cli.Port = 1661
	}
	var baseURL string
	if cli.HTTPS {
		baseURL = fmt.Sprintf("https://%s:%d", cli.Ip, cli.Port)
	} else {
		baseURL = fmt.Sprintf("http://%s:%d", cli.Ip, cli.Port)
	}
	return baseURL
}

func (inst *Client) SetTokenHeader(token string) *Client {
	inst.Rest.Header.Set("Authorization", composeToken(token))
	return inst
}

func composeToken(token string) string {
	return fmt.Sprintf("External %s", token)
}

type Path struct {
	Path string
}

var Paths = struct {
	Hosts        Path
	Ping         Path
	HostNetwork  Path
	Location     Path
	Users        Path
	Edge         Path
	Apps         Path
	Tasks        Path
	Transactions Path
	System       Path
	Networking   Path
	Wires        Path
}{
	Hosts:        Path{Path: "/api/hosts"},
	Ping:         Path{Path: "/api/system/ping"},
	HostNetwork:  Path{Path: "/api/networks"},
	Location:     Path{Path: "/api/locations"},
	Users:        Path{Path: "/api/locations"},
	Edge:         Path{Path: "/api/edgeapi"},
	Apps:         Path{Path: "/api/edgeapi/apps"},
	Tasks:        Path{Path: "/api/tasks"},
	Transactions: Path{Path: "/api/transactions"},
	System:       Path{Path: "/api/system"},
	Networking:   Path{Path: "/api/networking"},
	Wires:        Path{Path: "/api/wires"},
}

type Response struct {
	StatusCode int         `json:"code"`
	Message    interface{} `json:"message"`
	resty      *resty.Response
}

func (response Response) buildResponse(resp *resty.Response, err error) *Response {
	response.StatusCode = resp.StatusCode()
	response.resty = resp
	if resp.IsError() {
		response.Message = resp.Error()
	}
	if resp.StatusCode() == 0 {
		response.Message = "server is unreachable"
		response.StatusCode = 503
	}
	return &response
}
