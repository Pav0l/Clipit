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
	 --file docker/Dockerfile.clipit-api \
	 .

compose:
	docker compose up 

run:
	@docker run \
	 --name ${CONTAINER_NAME} \
	 -p 8000:8000 \
	 -p 9000:9000 \
	 --env PINATA_JWT=$(PINATA_JWT) \
	 --env TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID) \
	 --env SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY) \
	 --env USER_ID=$(USER_ID) \
	 ${IMAGE_NAME}

cleanup:
	docker container rm ${CONTAINER_NAME} && \
	docker image rm ${IMAGE_NAME}

run-dev:
	@PINATA_JWT=$(PINATA_JWT) \
	TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID) \
	SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY) \
	USER_ID=$(USER_ID) \
	go run ./app/services/clipit-api/main.go

