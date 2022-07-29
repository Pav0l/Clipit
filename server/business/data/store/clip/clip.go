package clip

import (
	"fmt"

	"github.com/Pav0l/Clipit/tree/master/server/foundation/pinata"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/twitchapi"
)

type Store struct {
	pinata pinata.Pinata
	clientOrigin string
	uriPrefix string
}

func NewStore(pinata pinata.Pinata, clientOrigin string) *Store {
	return &Store{
		pinata: pinata,
		clientOrigin: clientOrigin,
		uriPrefix: "ipfs://",
	}
}

func (s Store) PinataUploadClip(clipId string, video []byte) (string, error) {
	r, err := s.pinata.UploadFile(clipId, clipId + ".mp4", false, video)
	if err != nil {
		return "", fmt.Errorf("pinata upload clip: %w", err)
	}
	
	return r.IpfsHash, nil
}

func (s Store) PinataUploadMetadata(clipId string, data []byte) (string, error) {
	r, err := s.pinata.UploadFile(clipId, "metadata.json", true, data)
	if err != nil {
		return "", fmt.Errorf("pinata upload metadata: %w", err)
	}
	
	return r.IpfsHash, nil
}

func (s Store) NewClipMetadata(clip twitchapi.Clip, uploadedClip UploadedClip, payload Clip, gameName string) Metadata {
	return Metadata{
		ClipCid: uploadedClip.Cid,
		ClipId: clip.Id,
		Name: payload.ClipTitle,
		ClipUri: s.uriPrefix + uploadedClip.Cid,
		Description: payload.ClipDescription,
		ExternalUrl: fmt.Sprintf("%s/marketplace?contentHash=%x", s.clientOrigin, uploadedClip.ClipHash),
		ThumbnailUri: clip.ThumbnailUrl,
		Attributes: []Attributes{
			{
				TraitType: "Game",
				Value: gameName,
			},
			{
				TraitType: "Streamer",
				Value: clip.BroadcasterName,
			},
		},
	}
}

