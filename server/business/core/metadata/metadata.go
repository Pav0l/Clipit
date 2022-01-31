package metadata

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/clip-it/server/business/data/store/clip"
)

type Core struct {
	storage clip.Store
}

func NewCore(storage clip.Store) Core {
	return Core{
		storage: storage,
	}
}

func (c Core) UploadToIpfs(clipId string, m interface{}) (clip.UploadedMetadata, error) {
	metadataBytes, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		// TODO log/trace this
		return clip.UploadedMetadata{}, err
	}
	
	log.Println("uploading metadata to IPFS")
	
	cid, err := c.storage.PinataUploadMetadata(clipId, metadataBytes)
	if err != nil {
		// TODO log/trace this
		return clip.UploadedMetadata{}, fmt.Errorf("uploading to ipfs: %w", err)
	}

	return clip.UploadedMetadata{ Cid: cid }, nil
}
