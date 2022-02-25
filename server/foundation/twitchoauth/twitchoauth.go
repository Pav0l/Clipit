package twitchoauth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)


type TwitchCfg struct {
	ClientId string
	ClientSecret string
}

type TwitchOauth struct {
	client http.Client
	host string
	cfg TwitchCfg
}

func NewTwitchOauth(cfg TwitchCfg) *TwitchOauth {
	return &TwitchOauth {
		client: http.Client{
			Timeout: time.Second * 10,
		},
		host: "https://id.twitch.tv",
		cfg: cfg,
	}
}

type Token struct {
	Client_id string
	Login string
	Scopes []string
	User_id string
	Expires_in uint
	Token string // token does not come from the endpoint response, so we add it manually
}

func (t *TwitchOauth) ValidateToken(token string) (Token, error) {
	url := t.host + "/oauth2/validate"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return Token{}, fmt.Errorf("failed to create new request: %w", err)
	}

	req.Header.Add("Authorization", "Bearer " + token)

	resp, err := t.client.Do(req)
	if err != nil {
		return Token{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return Token{}, err
		}
		return Token{}, fmt.Errorf("%d:%s - %s", resp.StatusCode, resp.Status, string(msg))
	}

	var body Token
	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Token{}, err
	}

	body.Token = token

	return body, nil
}

type AppAccessToken struct {
	AccessToken string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn uint `json:"expires_in"`
	Scope []string `json:"scope"`
	TokenType string `json:"token_type"`
}

func (t *TwitchOauth) RequestAppAccessToken() (AppAccessToken, error) {
	url := t.host + "/oauth2/token"
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return AppAccessToken{}, fmt.Errorf("failed to create new request: %w", err)
	}

	q := req.URL.Query()
	q.Add("client_id", t.cfg.ClientId)
	q.Add("client_secret", t.cfg.ClientSecret)
	q.Add("grant_type", "client_credentials")
	req.URL.RawQuery = q.Encode()

	
	resp, err := t.client.Do(req)
	if err != nil {
		return AppAccessToken{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return AppAccessToken{}, err
		}
		return AppAccessToken{}, fmt.Errorf("%d:%s - %s", resp.StatusCode, resp.Status, string(msg))
	}

	// @note - it seems refresh_token response is emprty string
	// TODO access_token is valid for ~60 days - we should cache it to reuse until it expires
	var appTokenResp AppAccessToken
	if err = json.NewDecoder(resp.Body).Decode(&appTokenResp); err != nil {
		return AppAccessToken{}, err
	}

	return appTokenResp, nil
}
