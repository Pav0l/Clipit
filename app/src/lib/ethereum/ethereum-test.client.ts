import { signerEnsName } from "../../../tests/__fixtures__/ethereum";
import { EthereumTestProvider } from "./ethereum-test-provider";
import { IEthClient } from "./ethereum.client";
import { EthereumEvents, EthereumEventData, EthereumProvider } from "./ethereum.types";

export function EthereumTestClientCreator(provider: EthereumProvider): IEthClient {
  return new EthereumTestClient(provider);
}

class EthereumTestClient implements IEthClient {
  provider: EthereumProvider;
  constructor(testP?: EthereumProvider) {
    this.provider = testP ? testP : new EthereumTestProvider();
  }

  requestAccounts = async () => {
    return this.provider.request<Promise<string[]>>({ method: "eth_requestAccounts" });
  };

  ethAccounts = async () => {
    return this.provider.request<Promise<string[]>>({ method: "eth_accounts" });
  };

  resolveEnsName = (_address: string): Promise<string | null> => {
    return new Promise((res) => res(signerEnsName));
  };

  getBalance = async (_address: string) => {
    return this.provider.request<Promise<string>>({ method: "eth_getBalance" });
  };

  chainId = async () => {
    return this.provider.request<Promise<string>>({ method: "eth_chainid" });
  };

  registerEventHandler = (event: EthereumEvents, handler: (data: EthereumEventData) => void) => {
    this.provider.on(event, handler);
  };
}
