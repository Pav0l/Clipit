import { EthereumProvider } from "./src/lib/ethereum/ethereum.types";
import { IConfig } from "./src/domains/app/config";

export {};

declare global {
  const CONFIG: IConfig;

  interface Window {
    ethereum?: EthereumProvider;
    Twitch?: Twitch;
  }
}
