# ClipIt client application

## Development

Run:

- `yarn`
- `cp config/config.sample.json config/development.json` and fill out app configuration
- `yarn start`

### Configuration

Apps configuration is based on [node-config](https://github.com/lorenwest/node-config) package, which loads proper configuration file based on `NODE_ENV` variable (e.g. tests run with `NODE_ENV=test` so it loads config from `./config/test.json`)

## Deployment

App is deployed via `firebase-tools`. Make sure you've run `yarn` before attempting to deploy the App.
`TARGET_NAME` in scripts below is either `app` or `test`.

Run:

- TODO init steps
- `yarn fb:emulate:<TARGET_NAME>` to run the fb emulator to preview your changes of the app
- `yarn fb:deploy:<TARGET_NAME>` to deploy

# ClipIt Twitch extension

- generate certificates via `mkcert` into `./certs` folder: `mkcert -install -cert-file certs/cert.pem -key-file certs/key.p em localhost`
- run `yarn start:ext`

Open the extension in Chrome or inside Twitch Developer Rig
