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

	"github.com/Pav0l/Clipit/tree/master/server/app/services/clipit-api/handlers"
)

// Build variable is overwritten to git commit when running the go build commadn with -ldflags (check Dockerfile)
var Build = "development"

func main() {
	// Perform the startup and shutdown sequence.
	if err := run(); err != nil {
		fmt.Println("startup error", err)
		os.Exit(1)
	}
}

func run() error {
	log.Println("setup config for build:", Build)

	type webCfg struct {
		APIHost         string        
		DebugHost       string        
		ReadHeaderTimeout     time.Duration 
		WriteTimeout    time.Duration 
		IdleTimeout     time.Duration 
		ShutdownTimeout time.Duration 
	}
	type versionCfg struct {
		Build string
	}
	type corsCfg struct {
		Origin string
		AllowedOrigins string
	}
	type pinataCfg struct {
		Jwt string
	}
	type twitchCfg struct {
		ClientId string
		ClientSecret string
		EbsSecret string
	}
	type signerCfg struct {
		PrivateKey string
	}
	type clientCfg struct {
		Origin string
	}

	cfg := struct {
		Version versionCfg
		Web webCfg
		CORS corsCfg
		Pinata pinataCfg
		Twitch twitchCfg
		Signer signerCfg
		Client clientCfg
	} {
		Version: versionCfg {
			Build: Build,
		},
		Web: webCfg{
			APIHost: fmt.Sprintf("0.0.0.0:%s", loadEnvOrDefault("PORT", "8000")),
			DebugHost: fmt.Sprintf("0.0.0.0:%s", loadEnvOrDefault("DEBUG_PORT", "9000")),
			ReadHeaderTimeout: time.Second * 60,
			WriteTimeout: time.Second * 120,
			IdleTimeout: time.Second * 120,
			ShutdownTimeout: time.Second * 10,
		},
		CORS: corsCfg{
			Origin: loadEnvOrDefault("CORS_ORIGIN", "http://localhost:3000"),
			AllowedOrigins: loadEnvOrDefault("ALLOWED_ORIGINS", "http://localhost:3000 https://localhost:3001 https://localhost:3002"),
		},
		Pinata: pinataCfg{
			Jwt: loadEnvOrExit("PINATA_JWT"),
		},
		Twitch: twitchCfg{
			ClientId: loadEnvOrExit("TWITCH_CLIENT_ID"),
			ClientSecret: loadEnvOrExit("TWITCH_CLIENT_SECRET"),
			EbsSecret: loadEnvOrExit("TWITCH_EBS_SECRET"),
		},
		Signer: signerCfg{
			PrivateKey: loadEnvOrExit("SIGNER_PRIVATE_KEY"),
		},
		Client: clientCfg{
			Origin: loadEnvOrExit("CLIENT_ORIGIN"),
		},
	}

	// ==================== Start Debug Service ====================

	log.Println("starting debug router")

	debugMux := handlers.DebugMux(handlers.DebugMuxConfig{
		Build: cfg.Version.Build,
	})

	go func() {
		log.Println("starting debug server")
		if err := http.ListenAndServe(cfg.Web.DebugHost, debugMux); err != nil {
			log.Fatal("failed to start debug router. shutting down", err)
		}
	}()

	// ==================== Start API Service ====================

	log.Println("starting API router")

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
		Cors: cfg.CORS,
		Twitch: cfg.Twitch,
		Signer: cfg.Signer,
		Client: cfg.Client,
		Build: cfg.Version.Build,
	})

	api := http.Server{
		Addr: cfg.Web.APIHost,
		Handler: apiHandler,
		ReadHeaderTimeout: cfg.Web.ReadHeaderTimeout,
		WriteTimeout: cfg.Web.WriteTimeout,
		IdleTimeout: cfg.Web.IdleTimeout,
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
		log.Println("shutdown started. signal", sig)
		defer log.Println("shutdown complete. signal", sig)

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
