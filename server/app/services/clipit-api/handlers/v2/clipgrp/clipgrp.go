package clipgrp

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/Pav0l/Clipit/tree/master/server/business/core/clip"
	"github.com/Pav0l/Clipit/tree/master/server/business/core/game"
	"github.com/Pav0l/Clipit/tree/master/server/business/core/metadata"
	cStore "github.com/Pav0l/Clipit/tree/master/server/business/data/store/clip"
	"github.com/Pav0l/Clipit/tree/master/server/business/sys/auth"
	"github.com/Pav0l/Clipit/tree/master/server/business/sys/validate"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/signer"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/twitchapi"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/web"
	"github.com/ethereum/go-ethereum/common"
)

type Handlers struct {
	Clip clip.Core
	Metadata metadata.Core
	Game game.Core
	Signer signer.Signer
}

func (h Handlers) Upload(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	var payload cStore.Clip
	web.Decode(r, &payload)

	clip, err := twitchapi.GetCtxClip(ctx)
	if err != nil {
		return web.NewShutdownError("missing twitchapi.clip value from context")
	}

	log.Println(fmt.Sprintf("downloading clip \"%s\"' for address: %s", clip.Id, payload.Address))

	url, err := h.Clip.GetClipDownloadUrl(clip.Id)
	if err != nil {
		e := fmt.Errorf("fetching clip dl url: %w", err)
		return validate.NewRequestError(e, http.StatusFailedDependency)
	}

	token, err := auth.GetToken(ctx)
	if err != nil {
		return web.NewShutdownError("missing twitchoauth.token value from context")
	}

	gameChan := make(chan game.Result)
	// TODO - cache gameId - gameName map
	go h.Game.GetGame(clip.GameId, token.Token, gameChan)

	uploadedClip, err := h.Clip.UploadToIpfs(clip.Id, url)
	if err != nil {
		e := fmt.Errorf("uploading clip: %w", err)
		log.Println(e)
		return validate.NewRequestError(e, http.StatusFailedDependency)
	}

	game := <- gameChan
	if game.Err != nil {
		return validate.NewRequestError(game.Err, http.StatusFailedDependency)
	}

	log.Println("clip cid:", uploadedClip.Cid)

	mtdt := h.Clip.Storage.NewClipMetadata(clip, uploadedClip, payload, game.Name)

	// TODO run in go routine?
	metadataHash, err := h.Clip.GenerateMetadataHash(mtdt)
	if err != nil {
		e := fmt.Errorf("hashing metadata: %w", err)
		return validate.NewRequestError(e, http.StatusInternalServerError)
	}
	log.Println("metadata hash:", fmt.Sprintf("%x", metadataHash))

	mcid, err := h.Metadata.UploadToIpfs(clip.Id, mtdt)
	if err != nil {
		e := fmt.Errorf("uploading metadata: %w", err)
		log.Println(e)
		return validate.NewRequestError(e, http.StatusFailedDependency)
	}

	log.Println("metadata cid:", mcid.Cid)

	// TODO - consider if this dependency should be here directly from go-ethereum/common or in a foundation pkg
	senderAddress := common.HexToAddress(payload.Address).Bytes()
	msg := append(uploadedClip.ClipHash[:], senderAddress...)
	signature, err := h.Signer.Sign(msg)
	if err != nil {
		e := fmt.Errorf("signing message: %w", err)
		return validate.NewRequestError(e, http.StatusBadRequest)
	}

	log.Printf("msg signature:\nR:%s\nS:%s\nV:%d", signature.R, signature.S, signature.V)

	res := cStore.NewClip{ 
		MetadataCid: mcid.Cid,
		ClipSignature: cStore.Signature{
			R: signature.R,
			S: signature.S,
			V: signature.V,
		},
		Address: payload.Address,
		Id: clip.Id,
		Metadata: mtdt,
		MediaData: cStore.MediaData{
			TokenURI: mtdt.ClipUri,
			MetadataURI: "ipfs://" + mcid.Cid,
			ContentHash: uploadedClip.ClipHash,
			MetadataHash: metadataHash,
		},
	}
	return web.Respond(ctx, w, res, http.StatusCreated)
}
