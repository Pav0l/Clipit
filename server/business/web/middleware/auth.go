package middleware

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/clip-it/server/business/sys/auth"
	"github.com/clip-it/server/business/sys/validate"
	"github.com/clip-it/server/foundation/twitchapi"
	"github.com/clip-it/server/foundation/web"
)

// Authenticate parses the authorization token from request header and validates twitch OAuth API
func Authenticate(a *auth.Auth) web.Middleware {

	mw := func(handler web.Handler) web.Handler {

		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

			authHeader := r.Header.Get("Authorization")

			parts := strings.Split(authHeader, " ")
			authScheme := strings.ToLower(parts[0])
			if len(parts) != 2 || !(authScheme == "bearer" || authScheme == "ebs") {
				return validate.NewRequestError(errors.New("expected Authorization header with bearer/ebs token"), http.StatusUnauthorized)
			}

			token, err := a.ValidateTokenForScheme(authScheme, parts[1])
			// TODO add `externalCallCount` and duration
			if err != nil {
				// TODO log externalCallError
				log.Println("oauth validate token: ", err)
				return validate.NewRequestError(errors.New("invalid token"), http.StatusUnauthorized)
			}

			ctx = auth.SetToken(ctx, token)

			return handler(ctx, w, r)
		}

		return h
	}

	return mw
}


// AuthorizeClip verifies if caller is broadcaster of the clip, so that only broadcasters of the clip (streamer)
// is able to mint it. If caller is not broadcaster, we return 403
func AuthorizeClip(clientId string) web.Middleware {

	m := func(handler web.Handler) web.Handler {

		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

			token, err := auth.GetToken(ctx)
			if err != nil {
				return web.NewShutdownError("missing auth.token value from context")
			}

			clipId := web.Param(r, "clipId")
			if clipId == "" {
				return validate.NewRequestError(errors.New("missing clipId in route param"), http.StatusBadRequest)
			}

			// TODO log externalCall
			clip, err := twitchapi.NewTwitchApi(clientId).GetClip(clipId, token.Token)
			if err != nil {
				// TODO log externalCallError
				log.Println("get clip:", err)
				return validate.NewRequestError(errors.New("unable to get twitch clip data"), http.StatusBadRequest)
			}

			if clip.BroadcasterId != token.UserId {
				return validate.NewRequestError(errors.New("user not clip broadcaster"), http.StatusForbidden)
			}

			ctx = twitchapi.SetClip(ctx, clip)

			return handler(ctx, w, r)
		}

		return h
	}

	return m
}
