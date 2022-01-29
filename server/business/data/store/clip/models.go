package clip


type Clip struct {
	// address of the streamer generating signature to mint a Clip
	Address string `json:"address"`
	ClipTitle string `json:"clipTitle"`
	ClipDescription string `json:"clipDescription,omitempty"`
}

type NewClip struct {
	MetadataCid string `json:"metadataCid"`
	Address string `json:"address"`
	Id string `json:"id"`
	ClipSignature Signature `json:"signature"`
	Metadata Metadata `json:"metadata"`
	MediaData MediaData `json:"mediadata"`
}

type UploadedClip struct {
	Cid string `json:"cid"`
	ClipHash [32]byte
}

type Metadata struct {
	Name string `json:"name"`
	Description string `json:"description"`
	// Client app url of this clip
	ExternalUrl string `json:"external_url"`
	// IPFS url of the clip (ipfs://<cid>)
	ClipUri string `json:"clipUri"`
	ClipCid string `json:"clipCid"`
	ClipId string `json:"clipId"`
	ThumbnailUri string `json:"thumbnailUri"`
	Attributes []Attributes `json:"attributes"`
}

type Attributes struct {
	TraitType string `json:"trait_type"`
	Value string `json:"value"`
}

type Signature struct {
	R string `json:"r"`
	S string `json:"s"`
	V uint8	`json:"v"`
}

type MediaData struct {
	// A valid URI of the content represented by this token
	TokenURI string `json:"tokenURI"`
	// A valid URI of the metadata associated with this token
	MetadataURI string `json:"metadataURI"`
	// A SHA256 hash of the content pointed to by tokenURI
	ContentHash [32]byte `json:"contentHash"` 
	// A SHA256 hash of the content pointed to by metadataURI
	MetadataHash [32]byte `json:"metadataHash"` 
}

type UploadedMetadata struct {
	Cid string `json:"cid"`
}
