import { ethers } from "ethers"
import { EthereumProvider, ConnectInfo, ProviderRpcError, ChainId, ProviderMessage } from "./ethereum.types";


interface EventHandlers {
  handleConnect: (data: ConnectInfo) => void;
  handleDisconnect: (error: ProviderRpcError) => void;
  handleAccountsChange: (accounts: string[]) => void;
  handleMessage: (message: ProviderMessage) => void;
}

export default class EthereumClient {
  ethersProvider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
  chainId?: ChainId;

  constructor(private provider: EthereumProvider, eventHandlers: EventHandlers) {
    try {
      this.ethersProvider = new ethers.providers.Web3Provider(provider);
      this.signer = this.ethersProvider.getSigner();
    } catch (error) {
      throw new EthereumClientError('Invalid provider', { provider, error })
    }

    this.provider.on("connect", eventHandlers.handleConnect);
    this.provider.on("disconnect", eventHandlers.handleDisconnect);
    this.provider.on("accountsChanged", eventHandlers.handleAccountsChange);
    this.provider.on("chainChanged", this.handleChainChanged);
  }

  requestAccounts = async () => {
    return this.provider.request<Promise<string[]>>({ method: 'eth_requestAccounts' });
  }

  private handleChainChanged = (chainId: ChainId) => {
    console.log("[LOG]:chainChanged:chainId", chainId)
    if (this.chainId !== chainId) {
      window.location.reload();
    }
  }
}

class EthereumClientError extends Error {
  params: any;

  constructor(message: string, params?: any) {
    super(message);

    this.params = params;
  }
}
