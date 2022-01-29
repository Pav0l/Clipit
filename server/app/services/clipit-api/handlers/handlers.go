package handlers

import (
	"net/http"
	"net/http/pprof"
	"os"

	"github.com/clip-it/server/app/services/clipit-api/handlers/debuggrp"
	"github.com/clip-it/server/app/services/clipit-api/handlers/v2/clipgrp"

	cStore "github.com/clip-it/server/business/data/store/clip"

	"github.com/clip-it/server/business/core/clip"
	"github.com/clip-it/server/business/core/game"
	"github.com/clip-it/server/business/core/metadata"
	mw "github.com/clip-it/server/business/web/middleware"
	"github.com/clip-it/server/foundation/pinata"
	"github.com/clip-it/server/foundation/signer"
	"github.com/clip-it/server/foundation/twitchapi"
	"github.com/clip-it/server/foundation/twitchgql"
	"github.com/clip-it/server/foundation/web"
)

type APIMuxConfig struct {
	Shutdown chan os.Signal
	Pinata struct {
		Jwt string
	}
	CorsOrigin string
	Twitch struct {
		ClientId string
	}
	Signer struct {
		PrivateKey string
	}
}

// DebugStandardLibraryMux registers all the debug routes from the standard library
// into a new mux bypassing the use of the DefaultServerMux. Using the
// DefaultServerMux would be a security risk since a dependency could inject a
// handler into our service without us knowing it.
func DebugStdLibMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
	mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)

	return mux
}

func DebugMux() http.Handler {
	mux := DebugStdLibMux()

	debugGrp := debuggrp.Handlers{}

	mux.HandleFunc("/debug/ping", debugGrp.Ping)

	return mux
}

func ApiHandler(cfg APIMuxConfig) http.Handler {

	app := web.NewApp(cfg.Shutdown, cfg.CorsOrigin, mw.Errors(), mw.Metrics(), mw.Panics(), mw.Cors(cfg.CorsOrigin))

	v2Grp(app, cfg)

	return app
}

func v2Grp(app *web.App, cfg APIMuxConfig) {
	const version = "v2"

	storage := *cStore.NewStore(*pinata.NewPinata(cfg.Pinata.Jwt))

	cgh := clipgrp.Handlers{
		Clip: clip.NewCore(*twitchapi.NewTwitchApi(cfg.Twitch.ClientId), *twitchgql.NewTwitchGql(), storage),
		Metadata: metadata.NewCore(storage),
		Game: game.NewCore(*twitchapi.NewTwitchApi(cfg.Twitch.ClientId)),
		Signer: *signer.NewSigner(cfg.Signer.PrivateKey),
	}
	app.Handle(http.MethodPost, version, "/clips/:clipId", cgh.Upload, mw.Authenticate(), mw.AuthorizeClip())
}
