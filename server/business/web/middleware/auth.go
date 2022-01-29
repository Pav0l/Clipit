package middleware

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/clip-it/server/business/sys/validate"
	"github.com/clip-it/server/foundation/twitchapi"
	"github.com/clip-it/server/foundation/twitchoauth"
	"github.com/clip-it/server/foundation/web"
)

// Authenticate parses the authorization token from request header and validates twitch OAuth API
func Authenticate() web.Middleware {

	mw := func(handler web.Handler) web.Handler {

		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

			authHeader := r.Header.Get("Authorization")

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				return validate.NewRequestError(errors.New("expected Authorization header with bearer token"), http.StatusUnauthorized)
			}

			// TODO - cache result from this request for this token
			t, err := twitchoauth.NewTwitchOauth().ValidateToken(parts[1])
			// TODO add `externalCallCount` and duration
			if err != nil {
				// TODO log externalCallError
				return validate.NewRequestError(errors.New("invalid token"), http.StatusUnauthorized)
			}

			ctx = twitchoauth.SetToken(ctx, t)

			return handler(ctx, w, r)
		}

		return h
	}

	return mw
}


// AuthorizeClip verifies if caller is broadcaster of the clip, so that only broadcasters of the clip (streamer)
// is able to mint it. If caller is not broadcaster, we return 403
func AuthorizeClip() web.Middleware {

	m := func(handler web.Handler) web.Handler {

		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

			token, err := twitchoauth.GetToken(ctx)
			if err != nil {
				return web.NewShutdownError("missing twitchoauth.token value from context")
			}

			clipId := web.Param(r, "clipId")
			if clipId == "" {
				return validate.NewRequestError(errors.New("missing clipId in route param"), http.StatusBadRequest)
			}

			log.Println("fetch clip", clipId);

			// TODO log externalCall
			clip, err := twitchapi.NewTwitchApi(token.Client_id).GetClip(clipId, token.Token)
			if err != nil {
				// TODO log externalCallError
				return validate.NewRequestError(errors.New("unable to get twitch clip data"), http.StatusBadRequest)
			}

			// TODO hmm
			if token.User_id != os.Getenv("USER_ID") && clip.BroadcasterId != token.User_id {
				return validate.NewRequestError(errors.New("user not clip broadcaster"), http.StatusForbidden)
			}

			ctx = twitchapi.SetClip(ctx, clip)

			return handler(ctx, w, r)
		}

		return h
	}

	return m
}
