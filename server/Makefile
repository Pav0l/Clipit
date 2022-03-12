SHELL := /bin/bash
include .env
# get last commit hash (short version) for commit with "server:" in it
export GIT_COMMIT := $(shell git log --grep="server:" --format='%h' --max-count=1)
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

run:
	@docker run \
	 --name ${CONTAINER_NAME} \
	 -p 8000:8000 \
	 -p 9000:9000 \
	 --env PINATA_JWT=$(PINATA_JWT_DEV) \
	 --env TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID_DEV) \
	 --env TWITCH_CLIENT_SECRET=$(TWITCH_CLIENT_SECRET_DEV) \
	 --env TWITCH_EBS_SECRET=$(TWITCH_EBS_SECRET_DEV) \
	 --env SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY_DEV) \
	 --env CLIENT_ORIGIN=$(CLIENT_ORIGIN_DEV) \
	 ${IMAGE_NAME}

cleanup:
	docker container rm ${CONTAINER_NAME} && \
	docker image rm ${IMAGE_NAME}

run-dev:
	@PINATA_JWT=$(PINATA_JWT_DEV) \
	TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID_DEV) \
	TWITCH_CLIENT_SECRET=$(TWITCH_CLIENT_SECRET_DEV) \
	TWITCH_EBS_SECRET=$(TWITCH_EBS_SECRET_DEV) \
	SIGNER_PRIVATE_KEY=$(SIGNER_PRIVATE_KEY_DEV) \
	CLIENT_ORIGIN=$(CLIENT_ORIGIN_DEV) \
	go run ./app/services/clipit-api/main.go

LOCATION=europe-west1
gcp-deploy-stage-no-traffic:
	gcloud run deploy $(SERVICE_NAME) \
	--region $(LOCATION) \
	--allow-unauthenticated \
	--set-env-vars TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID_STAGE),CORS_ORIGIN=$(CORS_ORIGIN_STAGE),ALLOWED_ORIGINS=$(ALLOWED_ORIGINS_STAGE),CLIENT_ORIGIN=$(CLIENT_ORIGIN_STAGE) \
	--update-secrets PINATA_JWT=PINATA_JWT:1,TWITCH_CLIENT_SECRET=TWITCH_CLIENT_SECRET:1,TWITCH_EBS_SECRET=TWITCH_EBS_SECRET:1,SIGNER_PRIVATE_KEY=SIGNER_PRIVATE_KEY:1 \
	--revision-suffix $(GIT_COMMIT) \
	--tag stage \
	--no-traffic \
	--source . 

gcp-deploy-prod-no-traffic:
	gcloud run deploy $(SERVICE_NAME) \
	--region $(LOCATION) \
	--allow-unauthenticated \
	--set-env-vars TWITCH_CLIENT_ID=$(TWITCH_CLIENT_ID_PROD),CORS_ORIGIN=$(CORS_ORIGIN_PROD),ALLOWED_ORIGINS=$(ALLOWED_ORIGINS_PROD),CLIENT_ORIGIN=$(CLIENT_ORIGIN_PROD) \
	--update-secrets PINATA_JWT=PINATA_JWT:1,TWITCH_CLIENT_SECRET=TWITCH_CLIENT_SECRET:1,TWITCH_EBS_SECRET=TWITCH_EBS_SECRET:1,SIGNER_PRIVATE_KEY=SIGNER_PRIVATE_KEY:1 \
	--revision-suffix $(GIT_COMMIT) \
	--tag prod \
	--no-traffic \
	--source . 


# number between 1 - 100
TRAFFIC_PERCENT=100

# roll back to a previous revision
REVISION_NAME=$(SERVICE_NAME)-# <ADD REVISION COMMIT>
gcp-rollback:
	gcloud run services update-traffic $(SERVICE_NAME) \
	--to-revisions $(REVISION_NAME)=$(TRAFFIC_PERCENT)


# migrate traffic to a specific tagged revision
TAG_NAME=
gcp-traffic-to-tag:
	gcloud run services update-traffic $(SERVICE_NAME) \
	--to-tags $(TAG_NAME)=$(TRAFFIC_PERCENT)

