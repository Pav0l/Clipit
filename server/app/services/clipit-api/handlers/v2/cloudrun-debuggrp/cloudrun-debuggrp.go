package cloudrun_debuggrp

import (
	"context"
	"net/http"
	"os"

	"github.com/clip-it/server/foundation/web"
)

type Handlers struct {
	Build string
}

func (h *Handlers) Ping(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	host, err := os.Hostname()
	if err != nil {
		host = "not available"
	}

	data := struct {
		Status    string `json:"status,omitempty"`
		Host string `json:"host,omitempty"`
		Build string `json:"build"`
	}{
		Status: "ok",
		Host: host,
		Build: h.Build,
	}

	return web.Respond(r.Context(), w, data, http.StatusOK)
}
