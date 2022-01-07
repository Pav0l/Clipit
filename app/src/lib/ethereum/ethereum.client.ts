import { EthereumProvider, EthereumEvents, EthereumEventData } from "./ethereum.types";

export interface IEthClient {
  requestAccounts: () => Promise<string[]>;
  ethAccounts: () => Promise<string[]>;
  chainId: () => Promise<string>;
  registerEventHandler: (event: EthereumEvents, handler: (data: EthereumEventData) => void) => void;
}

export default class EthereumClient implements IEthClient {
  constructor(private provider: EthereumProvider) { }

  /**
   * requestAccounts opens MetaMask and asks user to connect wallet to app
   */
  requestAccounts = async () => {
    return this.provider.request<Promise<string[]>>({ method: 'eth_requestAccounts' });
  }

  /**
   * ethAccounts silently requests users account (without opening up MetaMask).
   * If MetaMask is not connected, it returns empty array.
   * It only opens MetaMask if user is not logged into MetaMask
   */
  ethAccounts = async () => {
    return this.provider.request<Promise<string[]>>({ method: 'eth_accounts' });
  }

  chainId = async () => {
    return this.provider.request<Promise<string>>({ method: 'eth_chainid' });
  }

  registerEventHandler = (event: EthereumEvents, handler: (data: EthereumEventData) => void) => {
    if (this.isListenerAlreadyRegistered(event, handler)) {
      return;
    }
    this.provider.on(event, handler);
  }

  private isListenerAlreadyRegistered(event: EthereumEvents, handler: (data: EthereumEventData) => void): boolean {
    // MM provider implements Node.js EventEmitter API (but I don't have its types rn)
    // https://docs.metamask.io/guide/ethereum-provider.html#events
    const listeners = (this.provider as any).listeners(event);
    for (const registeredListener of listeners) {
      if (registeredListener === handler) {
        return true;
      }
    }
    return false;
  }
}
