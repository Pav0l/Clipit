package validate

import (
	"errors"
	"log"
)

// ErrorResponse is the form used for API responses from failures in the API.
type ErrorResponse struct {
	Error  string `json:"error"`
}


// RequestError is used to pass the error and the status we want to response with from handler
// to error mw which will produce ErrorResponse from it
type RequestError struct {
	Err error
	Status int
}

// NewRequestError wraps a provided error with an HTTP status code. This
// function should be used when handlers encounter expected errors or in middleware
func NewRequestError(err error, status int) error {
	return &RequestError{err, status}
}

func ( err *RequestError) Error() string {
	return err.Err.Error()
}

// Cause iterates through all the wrapped errors until the root
// error value is reached.
func Cause(err error) error {
	root := err
	for {
		if err = errors.Unwrap(root); err == nil {
			return root
		}
		log.Println("not yet unwrapped", root)
		root = err
	}
}

