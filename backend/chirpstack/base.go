package chirpstack

import (
	"context"
	"errors"
	"fmt"
	"github.com/NubeIO/rubix-assist/service/clients/helpers/nresty"
	"github.com/go-resty/resty/v2"
	log "github.com/sirupsen/logrus"
	"net"
	"net/http"
	"sync"
	"time"
)

var (
	mutex   = &sync.RWMutex{}
	clients = map[string]*ChirpClient{}
)

type ChirpClient struct {
	client      *resty.Client
	ClientToken string
}

// The dialTimeout normally catches: when the server is unreachable and returns i/o timeout within 2 seconds.
// Otherwise, the i/o timeout takes 1.3 minutes on default; which is a very long time for waiting.
// It uses the DialTimeout function of the net package which connects to a server address on a named network before
// a specified timeout.
func dialTimeout(_ context.Context, network, addr string) (net.Conn, error) {
	timeout := 2 * time.Second
	return net.DialTimeout(network, addr, timeout)
}

var transport = http.Transport{
	DialContext: dialTimeout,
}

type Connection struct {
	Ip   string
	Port int
}

func New(conn *Connection) *ChirpClient {
	mutex.Lock()
	defer mutex.Unlock()
	if conn == nil {
		conn = &Connection{}
	}
	ip := conn.Ip
	port := conn.Port
	if ip == "" {
		ip = "0.0.0.0"
	}
	if port == 0 {
		port = 8080
	}

	url := fmt.Sprintf("http://%s:%d/api", ip, port)
	if flowClient, found := clients[url]; found {
		return flowClient
	}
	client := resty.New()
	client.SetDebug(false)
	client.SetBaseURL(url)
	client.SetError(&nresty.Error{})
	client.SetTransport(&transport)
	client.SetHeader("Content-Type", "application/json")
	flowClient := &ChirpClient{client: client}
	clients[url] = flowClient
	return flowClient
}

// SetToken set the REST auth token
func (inst *ChirpClient) SetToken(token string) {
	inst.ClientToken = token
	inst.client.SetHeader("Grpc-Metadata-Authorization", token)
}

// Login to CS with username and password to get token if not provided in config
func (inst *ChirpClient) Login(user string, pass string) error {
	token := CSLoginToken{}
	csURLConnect := "/internal/login"
	resp, err := inst.client.R().
		SetBody(CSCredentials{
			Email:    user,
			Password: pass,
		}).
		SetResult(&token).
		Post(csURLConnect)
	err = checkResponse(resp, err)
	if err != nil {
		log.Warn("lorawan: Login error: ", err)
	} else {
		inst.SetToken(token.Token)
	}
	return err
}

// ConnectTest test CS connection with API token
func (inst *ChirpClient) ConnectTest() error {
	log.Infof("lorawan: Connecting to chirpstack at %s", inst.client.BaseURL)
	csURLConnect := fmt.Sprintf("/applications?limit=%s", limit)
	resp, err := inst.client.R().
		SetResult(&CSApplications{}).
		Get(csURLConnect)
	err = checkResponse(resp, err)
	if err != nil {
		log.Warn("lorawan: Connection error: ", err)
	}
	return err
}

type CSApplications struct {
	Result []struct {
		ID string `json:"id"`
	} `json:"result"`
}

type CSCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CSLoginToken struct {
	Token string `json:"jwt"`
}

func checkResponse(resp *resty.Response, err error) error {
	if err != nil {
		return err
	}
	if resp.StatusCode() < 200 || resp.StatusCode() >= 300 {
		return errors.New(resp.Status())
	}
	return err
}
