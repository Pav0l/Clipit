package twitchoauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)


type TwitchOauth struct {
	client http.Client
	host string
}

func NewTwitchOauth() *TwitchOauth {
	return &TwitchOauth {
		client: http.Client{},
		host: "https://id.twitch.tv",
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

type ctxKey int

const key ctxKey = 1

// SetToken stores token data from validating twitch access token
func SetToken(ctx context.Context, token Token) context.Context {
	return context.WithValue(ctx, key, token)
}

// GetToken returns token data from context set by Authenticate middleware
func GetToken(ctx context.Context) (Token, error) {
	t, ok := ctx.Value(key).(Token)
	if !ok {
		return Token{}, errors.New("token value missing from request context")
	}
	return t, nil
}

