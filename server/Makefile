SHELL := /bin/bash
include .env
export GIT_COMMIT := $(shell git rev-parse --short HEAD)
export IMAGE_NAME := clipit-api:${GIT_COMMIT}
export CONTAINER_NAME := clipit

all: build run

build:
	@docker build \
	 --tag ${IMAGE_NAME} \
	 --build-arg BUILD_COMMIT=${GIT_COMMIT} \
	 --file Dockerfile \
	 .

compose:
	docker compose up 

# TODO PORTS!
run:
	@docker run \
	 --name ${CONTAINER_NAME} \
	 -p 8000:8000 \
	 -p 9000:9000 \
	 --env PINATA_JWT=$(PINATA_JWT) \
	 --env TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID) \
	 --env TWITCH_CLIENT_SECRET=$(TWITCH_CLIENT_SECRET) \
	 --env TWITCH_EBS_SECRET=$(TWITCH_EBS_SECRET) \
	 --env SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY) \
	 ${IMAGE_NAME}

cleanup:
	docker container rm ${CONTAINER_NAME} && \
	docker image rm ${IMAGE_NAME}

run-dev:
	@PINATA_JWT=$(PINATA_JWT) \
	TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID) \
	TWITCH_CLIENT_SECRET=$(TWITCH_CLIENT_SECRET) \
	TWITCH_EBS_SECRET=$(TWITCH_EBS_SECRET) \
	SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY) \
	go run ./app/services/clipit-api/main.go


LOCATION=us-central1
SERVICE_NAME=clipit

gcp-deploy:
	gcloud run deploy $(SERVICE_NAME) \
	--region $(LOCATION) \
	--allow-unauthenticated \
	--set-env-vars DEBUG_PORT=9000,TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID),TWITCH_CLIENT_SECRET=$(TWITCH_CLIENT_SECRET),TWITCH_EBS_SECRET=$(TWITCH_EBS_SECRET),CORS_ORIGIN=$(CORS_ORIGIN),ALLOWED_ORIGINS=$(ALLOWED_ORIGINS) \
	--source . 
