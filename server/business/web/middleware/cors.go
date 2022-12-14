package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/Pav0l/Clipit/tree/master/server/foundation/web"
)

// Cors sets the response headers needed for Cross-Origin Resource Sharing
func Cors(origin string, allowedOrigins string) web.Middleware {

	// This is the actual middleware function to be executed.
	m := func(handler web.Handler) web.Handler {

		// Create the handler that will be attached in the middleware chain.
		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
			reqOrigin := r.Header.Get("Origin")
			if strings.Contains(allowedOrigins, reqOrigin) {
				w.Header().Set("Access-Control-Allow-Origin", reqOrigin)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			// Set the CORS headers to the response.
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

			// Call the next handler.
			return handler(ctx, w, r)
		}

		return h
	}

	return m
}
