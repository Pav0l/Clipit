package middleware

import (
	"context"
	"log"
	"net/http"

	"github.com/Pav0l/Clipit/tree/master/server/business/sys/validate"
	"github.com/Pav0l/Clipit/tree/master/server/foundation/web"
)

// Errors transforms errors from handlers to error responses
func Errors() web.Middleware {

	mw := func (handler web.Handler) web.Handler {

		h := func (ctx context.Context, w http.ResponseWriter, r *http.Request) error {

			if err := handler(ctx, w, r); err != nil {

				log.Println(err)

				var er validate.ErrorResponse
				var status int

				switch a := validate.Cause(err).(type) {
				case *validate.RequestError:
					er = validate.ErrorResponse{
						Error: a.Error(),
					}
					status = a.Status
				default:
					er = validate.ErrorResponse{
						Error: http.StatusText(http.StatusInternalServerError),
					}
					status = http.StatusInternalServerError
				}

				// respond to client with error and status
				if err := web.Respond(ctx, w, er, status); err != nil {
					return err
				}

				// if we receive shutdown error, return it so we can gracefully shutdown the service
				if ok := web.IsShutdown(err); ok {
					return err
				}
			}

			// error handled, moving on
			return nil
		}

		return h
	}

	return mw
}
