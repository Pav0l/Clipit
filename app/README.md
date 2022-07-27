# Clipit frontend clients

## Configuration

Apps configuration is based on [node-config](https://github.com/lorenwest/node-config) package, which loads proper configuration file based on `NODE_ENV` variable (e.g. tests run with `NODE_ENV=test` so it loads config from `./config/test.json`)

To setup your clients config run:

- `cp config/config.sample.json config/development.json` and fill out app configuration

## Development

Run:

- `yarn` to install necessary dependencies

### Clipit client App

To start the Clipit App, run:

- `yarn app:start:dev`

### Clipit Demo app

To start the Clipit Demo page, run:

- `yarn demo:start:dev`

### Clipit Twitch extension

- generate certificates via `mkcert` into `./certs` folder: `mkcert -install -cert-file certs/cert.pem -key-file certs/key.p em localhost`
- run `yarn ext:start:dev`

Open the extension in Chrome or inside Twitch Developer Rig

## Deployment

App is deployed via `firebase-tools`. Make sure you've run `yarn` before attempting to deploy the App.
`TARGET_NAME` in scripts below is either `app`,`demo` or `ext`.

Run:

- `yarn <TARGET_NAME>:build:<ENV>` to create a build to deploy to specific `<ENV>` (`stage` or `prod`)
- `yarn <TARGET_NAME>:deploy:<ENV>` to deploy the build to specific `<ENV>`. Deploy is currently configured only for Demo app
