import { EthereumProvider } from "./src/lib/ethereum/ethereum.types";

export { };

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
