package handlers

import (
	"net/http"
	"net/http/pprof"
	"os"

	"github.com/Pav0l/Clipit/tree/master/server/app/services/clipit-api/handlers/debuggrp"
	"github.com/Pav0l/Clipit/tree/master/server/app/services/clipit-api/handlers/v2/clipgrp"
	cloudrun_debuggrp "github.com/Pav0l/Clipit/tree/master/server/app/services/clipit-api/handlers/v2/cloudrun-debuggrp"

	cStore "github.com/Pav0l/Clipit/tree/master/server/business/data/store/clip"

	"github.com/Pav0l/Clipit/tree/master/server/business/core/clip"
	"github.com/Pav0l/Clipit/tree/master/server/business/core/game"
	"github.com/Pav0l/Clipit/tree/master/server/business/core/metadata"
	"github.com/Pav0l/Clipit/tree/master/server/business/sys/auth"
	mw "github.com/Pav0l/Clipit/tree/master/server/business/web/middleware"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/pinata"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/signer"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/twitchapi"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/twitchgql"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/web"
)

type APIMuxConfig struct {
	Shutdown chan os.Signal
	Pinata struct {
		Jwt string
	}
	Cors struct {
		Origin string
		AllowedOrigins string
	}
	Twitch struct {
		ClientId string
		ClientSecret string
		EbsSecret string
	}
	Signer struct {
		PrivateKey string
	}
	Client struct {
		Origin string
	}
	Build string
}

type DebugMuxConfig struct {
	Build string
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

func DebugMux(cfg DebugMuxConfig) http.Handler {
	mux := DebugStdLibMux()

	debugGrp := debuggrp.Handlers{
		Build: cfg.Build,
	}

	mux.HandleFunc("/debug/ping", debugGrp.Ping)

	return mux
}

func ApiHandler(cfg APIMuxConfig) http.Handler {

	app := web.NewApp(cfg.Shutdown, cfg.Cors, mw.Errors(), mw.Metrics(), mw.Panics(), mw.Cors(cfg.Cors.Origin, cfg.Cors.AllowedOrigins))

	v2Grp(app, cfg)

	return app
}

func v2Grp(app *web.App, cfg APIMuxConfig) {
	const version = "v2"

	storage := cStore.NewStore(*pinata.NewPinata(cfg.Pinata.Jwt), cfg.Client.Origin)
	auth := auth.NewAuth(cfg.Twitch)
	twitchApi := twitchapi.NewTwitchApi(cfg.Twitch.ClientId)

	cgh := clipgrp.Handlers{
		Clip: clip.NewCore(twitchApi, twitchgql.NewTwitchGql(), storage),
		Metadata: metadata.NewCore(storage),
		Game: game.NewCore(twitchApi),
		Signer: *signer.NewSigner(cfg.Signer.PrivateKey),
	}
	// this exist so that we can have some debug endpoint when running on Cloud Run, where we can't run processes on multiple ports
	cloudrunDebuggrp := cloudrun_debuggrp.Handlers{
		Build: cfg.Build,
	}

	app.Handle(http.MethodPost, version, "/clips/:clipId", cgh.Upload, mw.Authenticate(auth), mw.AuthorizeClip(twitchApi))
	app.Handle(http.MethodGet, version, "/debug/ping", cloudrunDebuggrp.Ping)
}
