import { EthereumProvider } from "./src/lib/ethereum/ethereum.types";
import { IConfig } from "./src/domains/app/config";
import { TawkSdk } from "./src/lib/tawk/tawk.interface";

export {};

declare global {
  const CONFIG: IConfig;
  const COMMIT_HASH: string;

  interface Window {
    ethereum?: EthereumProvider;
    Tawk_API?: TawkSdk;

    clipit: {
      build: {
        commit: string;
        mode: "app" | "extension" | "demo";
      };
      config?: IConfig;
    };
  }
}
