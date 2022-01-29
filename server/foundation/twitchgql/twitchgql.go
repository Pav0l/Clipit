package twitchgql

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
)



type TwitchGql struct {
	Client http.Client
	Host string
	ClientId string
}

func NewTwitchGql() *TwitchGql {
	return &TwitchGql {
		Client: http.Client{},
		Host: "https://gql.twitch.tv/gql",
		ClientId: "kimne78kx3ncx6brgo4mv6wki5h1ko",
	}
}

type VideoQuality struct {
	FrameRate uint;
	Quality string;
	SourceUrl string;
}
type PlaybackAccessToken struct {
	Signature string;
	Value string;
}
type Clip struct {
	Id string;
	PlaybackAccessToken PlaybackAccessToken;
	VideoQualities []VideoQuality;
}

// GetClipAccessToken fetches clip id, playback access token and video qualities from Twitch GQL API
func (t *TwitchGql) GetClipAccessToken(slug string) (Clip, error) {
	payload := fmt.Sprintf(`[{"operationName":"VideoAccessToken_Clip","variables":{"slug":"%s"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"}}}]`, slug)

	req, err := http.NewRequest("POST", t.Host, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return Clip{}, err
	}

	req.Header.Add("Client-Id", t.ClientId)

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
		return Clip{}, errors.New(string(msg))
	}

	var body []struct{
		Data struct { Clip Clip `json:"clip"` } `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return Clip{}, err
	}

	return body[0].Data.Clip, nil
}

func selectHighestVideoQuality(q []VideoQuality) (string, error) {
	if len(q) == 0 {
		return "", errors.New("missing video qualities")
	}
	return q[0].SourceUrl, nil
}

// GetClipDownloadUrl returns URL that can be used to download twitch clip
func GetClipDownloadUrl(c Clip) (string, error) {
	base, err := selectHighestVideoQuality(c.VideoQualities)
	if err != nil {
		return "", err
	}

	u, err := url.Parse(base)
	if err != nil {
		return "", err
	}

	q := u.Query()
	q.Add("sig", c.PlaybackAccessToken.Signature)
	q.Add("token", c.PlaybackAccessToken.Value)

	u.RawQuery = q.Encode()

	return u.String(), nil
}
