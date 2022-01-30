SHELL := /bin/bash
VERSION := $(shell git rev-parse --short HEAD)
IMAGE_NAME := clipit-api:${VERSION}
CONTAINER_NAME := clipit

all: build run

build:
	docker build \
	 --tag $(IMAGE_NAME) \
	 --build-arg BUILD_VERSION=$(VERSION) \
	 --file docker/Dockerfile.clip-it-api \
	 .


run:
	docker run --name ${CONTAINER_NAME} -p 8000:8000 -p 9000:9000 ${IMAGE_NAME}


cleanup:
	docker container rm ${CONTAINER_NAME} && \
	docker image rm $(IMAGE_NAME)


