# Clipit backend API

## Development

The server can be run either directly by from the Golang compiled binary or via Docker. Check `Makefile` for scripts regarding Docker.

- `cp .env.sample .env` and fill out necessary environment variables
- `make run-dev`

## Deployment

To deploy the server, either run:

- `SERVICE_NAME=<your-gcp-service-name> make gcp-deploy-stage-no-traffic`

or

- `SERVICE_NAME=<your-gcp-service-name> make gcp-deploy-prod-no-traffic`
