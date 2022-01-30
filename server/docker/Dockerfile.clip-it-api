# syntax=docker/dockerfile:1

# use the official Go base image
FROM golang:1.16 AS builder
# specify build-time variables
ARG BUILD_COMMIT
# build statically linked binary https://www.reddit.com/r/golang/comments/pi97sp/what_is_the_consequence_of_using_cgo_enabled0/
ENV CGO_ENABLED 0

# create a directory and use it as default destination for all subsequent commands
WORKDIR /service

# download service dependencies necessary to compile the app
COPY go.mod ./
COPY go.sum ./
RUN go mod download

# copy files to container filesytem
COPY . ./

# change to services directory and build the executable
WORKDIR app/services/clipit-api
RUN go build -ldflags="-X main.Build=${BUILD_COMMIT}"


# create a lightweight alpine image to run the executable
FROM alpine:3.15.0

WORKDIR /service

# copy the relevat folder from builder to current image
COPY --from=builder /service/app/services/clipit-api/ ./

# run the executable
CMD ["./clipit-api"]
