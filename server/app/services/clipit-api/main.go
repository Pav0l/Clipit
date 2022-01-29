package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime/debug"
	"syscall"
	"time"

	"github.com/clip-it/server/app/services/clipit-api/handlers"
	"github.com/joho/godotenv"
)


func main() {
	// Perform the startup and shutdown sequence.
	if err := run(); err != nil {
		fmt.Println("startup error", err)
		os.Exit(1)
	}
}

func run() error {
	log.Println("loading up envs")
	err := godotenv.Load()
  if err != nil {
    log.Fatal("error loading .env file")
  }

	log.Print("setting up app config")

	type webCfg struct {
		APIHost         string        
		DebugHost       string        
		ReadTimeout     time.Duration 
		WriteTimeout    time.Duration 
		// IdleTimeout     time.Duration 
		ShutdownTimeout time.Duration 
	}
	type corsCfg struct {
		Origin string
	}
	type pinataCfg struct {
		Jwt string
	}
	type twitchCfg struct {
		ClientId string
	}
	type signerCfg struct {
		PrivateKey string
	}

	cfg := struct {
		Version string
		Web webCfg
		CORS corsCfg
		Pinata pinataCfg
		Twitch twitchCfg
		Signer signerCfg
	} {
		Version: "0.0.1",
		Web: webCfg{
			APIHost: loadEnvOrDefault("API_HOST", "0.0.0.0:8000"),
			DebugHost: loadEnvOrDefault("DEBUG_HOST", "0.0.0.0:9000"),
			ReadTimeout: time.Second * 60,
			WriteTimeout: time.Second * 120,
			// TODO make sure timeouts are set properly in all clients making external calls
			// IdleTimeout: time.Second * 120,
			ShutdownTimeout: time.Second * 10,
		},
		CORS: corsCfg{
			Origin: loadEnvOrDefault("CORS_ORIGIN", "http://localhost:3000"),
		},
		Pinata: pinataCfg{
			Jwt: loadEnvOrExit("PINATA_JWT"),
		},
		Twitch: twitchCfg{
			ClientId: loadEnvOrExit("TWITCH_CLIENT_ID"),
		},
		Signer: signerCfg{
			PrivateKey: loadEnvOrExit("SIGNER_PRIVATE_KEY"),
		},
	}

	// ==================== Start Debug Service ====================

	log.Print("starting debug router")

	debugMux := handlers.DebugMux()

	go func() {
		log.Print("starting debug server")
		if err := http.ListenAndServe(cfg.Web.DebugHost, debugMux); err != nil {
			log.Fatal("failed to start debug router. shutting down", err)
		}
	}()

	// ==================== Start API Service ====================

	log.Print("starting API router")

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	// Handle panics when initializing handler or api server
	defer func() {
		if rec := recover(); rec != nil {

			// Provide stack trace
			trace := debug.Stack()
			log.Println(fmt.Errorf("PANIC [%v] TRACE[%s]", rec, string(trace)))

			shutdown <- syscall.SIGTERM
		}
	}()

	apiHandler := handlers.ApiHandler(handlers.APIMuxConfig{
		Shutdown: shutdown,
		Pinata: cfg.Pinata,
		CorsOrigin: cfg.CORS.Origin,
		Twitch: cfg.Twitch,
		Signer: cfg.Signer,
	})

	api := http.Server{
		Addr: cfg.Web.APIHost,
		Handler: apiHandler,
		ReadTimeout: cfg.Web.ReadTimeout,
		WriteTimeout: cfg.Web.WriteTimeout,
	}

	// Make a channel to listen for errors coming from the listener. Use a
	// buffered channel so the goroutine can exit if we don't collect this error.
	serverErrors := make(chan error, 1)

	go func() {
		log.Printf("starting API server on %s", cfg.Web.APIHost)
		serverErrors <- api.ListenAndServe()
	}()


	// Blocking main and waiting for shutdown.
	select {
	case err := <-serverErrors:
		return fmt.Errorf("server error: %w", err)

	case sig := <-shutdown:
		log.Print("shutdown", "status", "shutdown started", "signal", sig)
		defer log.Print("shutdown", "status", "shutdown complete", "signal", sig)

		// Give outstanding requests a deadline for completion.
		ctx, cancel := context.WithTimeout(context.Background(), cfg.Web.ShutdownTimeout)
		defer cancel()

		// Asking listener to shutdown and shed load.
		if err := api.Shutdown(ctx); err != nil {
			api.Close()
			return fmt.Errorf("could not stop server gracefully: %w", err)
		}
	}

	return nil
}

func loadEnvOrDefault(key string, defValue string) string {
	val, ok := os.LookupEnv(key)
	if !ok {
		return defValue
	}
	return val
}

func loadEnvOrExit(key string) string {
	val, ok := os.LookupEnv(key)
	if !ok {
		log.Fatalf("%s key not set in environment", key)
	}
	return val
}
