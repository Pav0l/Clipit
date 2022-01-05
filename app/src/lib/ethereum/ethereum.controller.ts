import { ethers } from "ethers"
import { SnackbarClient } from "../snackbar/snackbar.client";
import { EthereumModel, } from "./ethereum.model";
import { EthereumProvider, ConnectInfo, ProviderRpcError, ChainId, ProviderMessage, isRpcError, RpcErrors } from "./ethereum.types";
import { MetaMaskErrors } from "./ethereum.model";



export default class EthereumController {

  constructor(private model: EthereumModel, private provider: EthereumProvider, private snackbar: SnackbarClient) {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      this.model.setSigner(ethersProvider.getSigner())
    } catch (error) {
      throw new EthereumClientError('invalid_provider', { provider, error })
    }

    this.provider.on("connect", this.handleConnect);
    this.provider.on("disconnect", this.handleDisconnect);
    this.provider.on("accountsChanged", this.handleAccountsChange);
    this.provider.on("chainChanged", this.handleChainChanged);
    this.provider.on("message", this.handleMessage);
  }

  /**
   * requestAccounts opens MetaMask and asks user to connect wallet to app
   */
  requestAccounts = async () => {
    try {
      const accounts = await this.provider.request<Promise<string[]>>({ method: 'eth_requestAccounts' });
      console.log('[ethereum.controller]:requestAccounts:accounts', accounts);

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:requestAccounts:error", error);

      if (isRpcError(error)) {
        switch (error.code) {
          case RpcErrors.REQUEST_ALREADY_PENDING:
            this.snackbar.sendError(MetaMaskErrors.REQUEST_ALREADY_PENDING)
            return;

          default:
            this.snackbar.sendError(MetaMaskErrors.CONNECT_METAMASK);
            return;
        }
      }
      this.snackbar.sendError(MetaMaskErrors.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * ethAccounts silently requests users account (without opening up MetaMask).
   * If MetaMask is not connected, it returns empty array.
   * It only opens MetaMask if user is not logged into MetaMask
   */
  ethAccounts = async () => {
    try {
      const accounts = await this.provider.request<Promise<string[]>>({ method: 'eth_accounts' });
      console.log('[ethereum.controller]:ethAccounts:accounts', accounts);

      this.model.setAccounts(accounts);
    } catch (error) {
      console.log("[ethereum.controller]:ethAccounts:error", error);
    }
  }

  chainId = async () => {
    try {
      const chainId = await this.provider.request<Promise<string>>({ method: 'eth_chainid' });
      console.log('[ethereum.controller]:chainId:', chainId);

      this.model.setChainId(chainId);
    } catch (error) {
      console.log("[ethereum.controller]:chainId:error", error);
    }
  }

  private handleChainChanged = (chainId: ChainId) => {
    console.log("[LOG]:chainChanged:chainId", chainId)
    if (this.model.chainId !== chainId) {
      window.location.reload();
    }
  }

  private handleAccountsChange = (accounts: string[]) => {
    console.log('[ethereum.controller]: handleAccountsChange', accounts);
    this.model.setAccounts(accounts);
  }
  private handleConnect = (data: ConnectInfo) => console.log("handleConnect", data)
  private handleDisconnect = (data: ProviderRpcError) => console.log("handleDisconnect", data)
  private handleMessage = (data: ProviderMessage) => console.log("handleMessage", data)
}

class EthereumClientError extends Error {
  params: any;

  constructor(message: string, params?: any) {
    super(message);

    this.params = params;
  }
}

