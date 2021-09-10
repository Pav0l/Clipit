import ClipItError, { ErrorCodes } from "../errors/errors";
import { EthereumProvider, ConnectInfo, ProviderRpcError, ChainId } from "../ethereum/ethereum.types";


interface EventHandlers {
  handleConnect: (data: ConnectInfo) => ChainId;
  handleDisconnect: (error: ProviderRpcError) => ProviderRpcError;
  handleAccountsChange: (accounts: string[]) => string[];
}

/**
 * @deprecated - use EthereumClient instead
 */
export default class MetamaskClient {
  chainId?: ChainId;

  constructor(private provider: EthereumProvider, eventHandlers: EventHandlers) {
    // provider === window.ethereum | null
    if (!provider) {
      throw new ClipItError("Invalid provider", ErrorCodes.MISSING_PROVIDER);
    }

    if (!provider.isConnected()) {
      throw new ClipItError("It seems we can't connect to the Ethereum blockchain. Please check your internet connection", ErrorCodes.RPC_DISCONNECT)
    }

    console.log('[LOG]:metamaskClient:registering listeners');
    this.provider.on("connect", eventHandlers.handleConnect);
    this.provider.on("disconnect", eventHandlers.handleDisconnect);
    this.provider.on("accountsChanged", eventHandlers.handleAccountsChange);
    this.provider.on("chainChanged", this.handleChainChanged);
  }

  async requestAccount(): Promise<string[]> {
    console.log("[LOG]:metamaskClient:requestAccout");
    const resp = await this.provider.request<string[]>({ method: "eth_requestAccounts" });
    console.log("[LOG]:metamaskClient:requestAccout:resp", resp);
    return resp;
  }

  async requestChainId() {
    this.chainId = await this.provider.request({ method: "eth_chainId" });
  }

  private handleChainChanged = (chainId: ChainId) => {
    console.log("[LOG]:chainChanged:chainId", chainId)
    if (this.chainId !== chainId) {
      window.location.reload();
    }
  }
}

function hCC(chainId: ChainId) {
  console.log("[LOG]:chainChanged:chainId", chainId)

}

