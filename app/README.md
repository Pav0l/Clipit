# ClipIt client application

## Development

Run:

- `yarn`
- `cp config/config.sample.json config/development.json` and fill out app configuration
- `yarn start`

### Configuration

Apps configuration is based on [node-config](https://github.com/lorenwest/node-config) package, which loads proper configuration file based on `NODE_ENV` variable (e.g. tests run with `NODE_ENV=test` so it loads config from `./config/test.json`)
