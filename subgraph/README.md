# Clipit indexer (Subgraph)

## Deployment

To deploy the indexer as a Subgraph you need to have:

- Smart Contracts deployed on Ethereum network to prepare configuration for your Subgraph in `/config` folder
- Contracts ABIs in the `/abis` folder
- Subgraph created in your TheGraph [Dashboard](https://thegraph.com/hosted-service/dashboard)

To deploy the Subgraph to e.g. Rinkeby run:

- `yarn` to install necessary dependencies
- `yarn prepare:rinkeby` to prepare the `subgraph.yaml` file from the template
- `yarn codegen` to generate AssemblyScript types for smart contract ABIs and the subgraph schema
- `yarn build` to compile the subgraph into WebAsembly
- `yarn deploy` to deploy the subhraph as a Graph Node
