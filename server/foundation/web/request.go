package web

import (
	"encoding/json"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Param returns URL parameter from a request
func Param(r *http.Request, key string) string {
	params := httprouter.ParamsFromContext(r.Context())
	return params.ByName(key)
}

// Decode reads the body of an HTTP request looking for a JSON document. The
// body is decoded into the provided value.
//
// If the provided value is a struct then it is checked for validation tags.
func Decode(r *http.Request, val interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(val); err != nil {
		return err
	}

	return nil
}

func Query(r *http.Request, key string) string {
	return r.URL.Query().Get(key)
}
