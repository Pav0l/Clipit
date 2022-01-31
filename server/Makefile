SHELL := /bin/bash
export GIT_COMMIT := $(shell git rev-parse --short HEAD)
export IMAGE_NAME := clipit-api:${GIT_COMMIT}
export CONTAINER_NAME := clipit

all: build run

build:
	docker build \
	 --tag ${IMAGE_NAME} \
	 --build-arg BUILD_COMMIT=${GIT_COMMIT} \
	 --file docker/Dockerfile.clipit-api \
	 .

compose:
	docker compose up 

run:
	docker run --name ${CONTAINER_NAME} -p 8000:8000 -p 9000:9000 ${IMAGE_NAME}


cleanup:
	docker container rm ${CONTAINER_NAME} && \
	docker image rm ${IMAGE_NAME}

