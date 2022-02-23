package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"syscall"

	"github.com/julienschmidt/httprouter"
)

type Handler func(ctx context.Context, w http.ResponseWriter, r *http.Request) error

type App struct {
	router *httprouter.Router
	shutdown chan os.Signal
	mw []Middleware
}

type Cors struct {
	Origin string
	AllowedOrigins string
}

func NewApp(shutdown chan os.Signal, CORS Cors, mw ...Middleware) *App {
	router := httprouter.New()

	router.GlobalOPTIONS = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqOrigin := r.Header.Get("Origin")
		if strings.Contains(CORS.AllowedOrigins, reqOrigin) {
			w.Header().Set("Access-Control-Allow-Origin", reqOrigin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", CORS.Origin)
		}
		// Set the CORS headers to the response.
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// Adjust status code to 204
		w.WriteHeader(http.StatusNoContent)
	})

	return &App{
		router: router,
		shutdown: shutdown,
		mw: mw,
	}
}

func (a *App) SignalShutdown() {
	fmt.Println("registered SIGTERM!")
	a.shutdown <- syscall.SIGTERM
}

func (a *App) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.router.ServeHTTP(w, r)
}

// Handle sets a handler function with its middleware for a HTTP method and path to servers router
func (a *App) Handle(method string, group string, path string, handler Handler, mw ...Middleware) {

	log.Printf("Registering handler: %s /%s%s", method, group, path)

	// First wrap handler specific middleware
	handler = wrapMiddleware(mw, handler)

	// Then wrap apps middleware, so it's executed first
	handler = wrapMiddleware(a.mw, handler)

	routeHandler := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Call the wrapped handler functions.
		if err := handler(ctx, w, r); err != nil {
			log.Println("handler err", err)

			a.SignalShutdown()
			return
		}
	}

	finalPath := path
	if group != "" {
		finalPath = "/" + group + path
	}

	a.router.HandlerFunc(method, finalPath, routeHandler)
}
