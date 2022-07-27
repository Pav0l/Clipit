# Clipit Smart Contracts

## Development

To run the contracts locally, run:

```bash
# install dependencies
npm install

# start up local JSON-RPC server via Hardhat
npx hardhat node

# deploys contracts via scripts/deploy.ts on local network
npm run deploy:localhost

```

You can interact with the contracts via scripts in `/scripts` folder by running `npx hardhat run <path_to_script>`.

## Deployment

To deploy contracts on Ethereum Testnets/Mainnet:

- create `${networkId}.json` file in `/deployments` folder if it doesn't exist yet
- run `npx hardhat run ./scripts/deploy.ts --network ${network_name}`

Contracts are deployed to following addresses on Rinkeby network:

```json
{
  "market": "0xC95fBd35112085E6766073FBb1c576e5AeeAa7dc",
  "token": "0x8B76640FdF0646af37D709C7257ed68E6d2b9054",
  "auction": "0x61c47E12647EcE1b23579458c719f1c01bacE810",
  "weth": "0xc778417e063141139fce010982780140aa0cd5ab"
}
```

Rinkeby testnet network is planned to be [deprecated](https://blog.ethereum.org/2022/06/21/testnet-deprecation/) sometime in Q2/Q3 2023 after transition of Ethereum to PoS and these contracts will not be redeployed to other testnets.
