package twitchapi

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)


type TwitchApi struct {
	Client http.Client
	Host string
	ClientId string
}

func NewTwitchApi(clientId string) *TwitchApi {
	return &TwitchApi {
		Client: http.Client{
			Timeout: time.Second * 10,
		},
		Host: "https://api.twitch.tv/helix",
		ClientId: clientId,
	}
}


type Clip struct {
	Id string `json:"id"`
  BroadcasterId string `json:"broadcaster_id"`
  BroadcasterName string `json:"broadcaster_name"`
  GameId string `json:"game_id"`
  Title string `json:"title"`
	ViewCount uint `json:"view_count"`
	ThumbnailUrl string `json:"thumbnail_url"`
}

func (t *TwitchApi) GetClip(id string, token string) (Clip, error) {
	reqUrl := t.Host + "/clips"
	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return Clip{}, fmt.Errorf("failed to create new request: %w", err)
	}

	req.Header.Add("Authorization", "Bearer " + token)
	req.Header.Add("Client-Id", t.ClientId)

	q := req.URL.Query()
	q.Add("id", id)
	req.URL.RawQuery = q.Encode()

	resp, err := t.Client.Do(req)
	if err != nil {
		return Clip{}, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return Clip{}, err
		}
		return Clip{}, fmt.Errorf("%d:%s - %s", resp.StatusCode, resp.Status, string(msg))
	}

	var body struct{
		Data []Clip `json:"data"`
	}

	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Clip{}, err
	}

	if len(body.Data) == 0 {
		return Clip{}, fmt.Errorf("clip with id: %s does not exist", id)
	}

	return body.Data[0], nil
}

type Game struct {
	Id string `json:"id"`
	Name string `json:"name"`
}

func (t *TwitchApi) GetGame(id string, token string) (Game, error) {
	reqUrl := t.Host + "/games"
	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return Game{}, fmt.Errorf("failed to create new request: %w", err)
	}

	req.Header.Add("Authorization", "Bearer " + token)
	req.Header.Add("Client-Id", t.ClientId)

	q := req.URL.Query()
	q.Add("id", id)
	req.URL.RawQuery = q.Encode()

	resp, err := t.Client.Do(req)
	if err != nil {
		return Game{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return Game{}, err
		}
		return Game{}, fmt.Errorf("%d:%s - %s", resp.StatusCode, resp.Status, string(msg))
	}

	var body struct{
		Data []Game `json:"data"`
	}
	if err = json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Game{}, err
	}

	return body.Data[0], nil
}

type ctxKey int

const key ctxKey = 1

// SetClip stores clip data from twitch API
func SetClip(ctx context.Context, token Clip) context.Context {
	return context.WithValue(ctx, key, token)
}

// GetClip returns clip data
func GetCtxClip(ctx context.Context) (Clip, error) {
	c, ok := ctx.Value(key).(Clip)
	if !ok {
		return Clip{}, errors.New("clip value missing from request context")
	}
	return c, nil
}


