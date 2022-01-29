package debuggrp

import (
	"log"
	"net/http"
	"os"

	"github.com/clip-it/server/foundation/web"
)

type Handlers struct {

}

func (h *Handlers) Ping(w http.ResponseWriter, r *http.Request) {
	host, err := os.Hostname()
	if err != nil {
		host = "not available"
	}

	data := struct {
		Status    string `json:"status,omitempty"`
		Host string `json:"host,omitempty"`
	}{
		Status: "ok",
		Host: host,
	}

	if err := web.Respond(r.Context(), w, data, http.StatusOK); err != nil {
		log.Print("failed to respond to ping", err)
	}
}
