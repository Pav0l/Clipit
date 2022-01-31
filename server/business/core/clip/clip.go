package clip

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/clip-it/server/business/data/store/clip"
	"github.com/clip-it/server/foundation/twitchapi"
	"github.com/clip-it/server/foundation/twitchgql"
)

type Core struct {
	TwitchApi twitchapi.TwitchApi
	TwitchGql twitchgql.TwitchGql
	Storage clip.Store
}

func NewCore(twitchapi twitchapi.TwitchApi, twitchgql twitchgql.TwitchGql, storage clip.Store) Core {
	return Core{
		TwitchApi: twitchapi,
		TwitchGql: twitchgql,
		Storage: storage,
	}
}

func (c *Core) GetClipDownloadUrl(clipId string) (string, error) {
	cat, err := c.TwitchGql.GetClipAccessToken(clipId)
	if err != nil {
		return "", fmt.Errorf("fetching clip access token: %w", err)
	}

	url, err := twitchgql.GetClipDownloadUrl(cat)
	if err != nil {
		return "", fmt.Errorf("building clip dl url: %w", err)
	}

	return url, nil
}


// DownloadClip used to download a clip from a url
// @dev - currently unused
func (c *Core) DownloadClip(clipId string, url string) error {
	cl := http.Client{
		// TODO do timeout and handle it
		// Timeout: time.Second * 10,
	}
	resp, err := cl.Get(url)
	if err != nil {
		return fmt.Errorf("fetching clip: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		msg, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		return fmt.Errorf("%d: %s - %s", resp.StatusCode, resp.Status, string(msg))
	}

	f, err := os.Create("vid.mp4")
	if err != nil {
		return fmt.Errorf("creating vid: %w", err)
	}
	defer f.Close()

	_, err = io.Copy(f, resp.Body)
	if err != nil {
		return fmt.Errorf("copying vid: %w", err)
	}

	return nil
}


func (c *Core) UploadToIpfs(clipId string, url string) (clip.UploadedClip, error) {
	cl := http.Client{
		// TODO do timeout and handle it
		// Timeout: time.Second * 10,
	}
	resp, err := cl.Get(url)
	if err != nil {
		// TODO log/trace this
		return clip.UploadedClip{}, fmt.Errorf("fetching clip: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return clip.UploadedClip{}, fmt.Errorf("reading video response body: %w", err)
	}

	log.Println("video content length", resp.Header.Get("Content-Length"))
	log.Println("uploading video to IPFS")

	cid, err := c.Storage.PinataUploadClip(clipId, body)
	if err != nil {
		// TODO log/trace this
		return clip.UploadedClip{}, fmt.Errorf("uploading to ipfs: %w", err)
	}

	log.Println("video file uploaded, creating its hash")
	hash := hashData(body)
	log.Println("video hash:", fmt.Sprintf("%x", hash))

	return clip.UploadedClip{Cid: cid, ClipHash: hash}, nil
}

// TODO this could live in core/metadata
func (c *Core) GenerateMetadataHash(data clip.Metadata) ([32]byte, error) {
	bytes, err := json.Marshal(data)

	if err != nil {
		var arr [32]byte
		return arr, fmt.Errorf("marshaling metadata: %w", err)
	}

	return hashData(bytes), nil
}


func hashData(data []byte) [32]byte {
	return sha256.Sum256(data)
}
