package clip

import (
	"fmt"

	"github.com/clip-it/server/foundation/pinata"
)

type Store struct {
	pinata pinata.Pinata
}

func NewStore(pinata pinata.Pinata) *Store {
	return &Store{
		pinata: pinata,
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
