import { BigNumber } from "ethers";

import { SnackbarClient } from "../snackbar/snackbar.controller";
import { ChainId, EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { Web3Model, Web3Errors } from "./web3.model";
import { isRpcError, RpcErrors } from "../../lib/ethereum/rpc.errors";
import { IEthClient } from "../../lib/ethereum/ethereum.client";
import { SentryClient } from "../../lib/sentry/sentry.client";
import { AppError } from "../../lib/errors/errors";

export interface IWeb3Controller {
  // silently try to get ethAccounts
  requestEthAccounts: () => Promise<void>;
  // open MM and call requestAccounts
  requestConnect: () => Promise<void>;
  // get current users balance
  getBalance: (address: string) => Promise<void>;
  requestConnectIfProviderExist: () => Promise<void>;
}

export class Web3Controller implements IWeb3Controller {
  private ethClient?: IEthClient;

  constructor(
    private model: Web3Model,
    private ethClientCreator: (provider: EthereumProvider) => IEthClient,
    private snackbar: SnackbarClient,
    private sentry: SentryClient
  ) {}

  requestEthAccounts = async () => {
    if (!this.model.isMetaMaskInstalled()) {
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    await this.ethAccounts();
  };

  requestConnect = async () => {
    // TODO consider if we even need these model.meta.setErrors or this method
    if (!this.model.isMetaMaskInstalled()) {
      this.model.meta.setError(new AppError({ msg: Web3Errors.INSTALL_METAMASK, type: "missing-provider" }));
      return;
    }

    // MM connected already -> nothing to do
    if (this.model.isProviderConnected()) {
      return;
    }

    await this.requestAccounts();

    const signerAddress = this.model.getAccount();
    if (!signerAddress) {
      this.model.meta.setError(new AppError({ msg: Web3Errors.CONNECT_METAMASK, type: "connect-provider" }));
      return;
    }
  };

  getBalance = async (address: string) => {
    try {
      const balance = await this.ethereum.getBalance(address);
      this.model.setEthBalance(BigNumber.from(balance));
    } catch (error) {
      this.sentry.captureException(error);
    }
  };

  requestConnectIfProviderExist = async () => {
    if (!this.model.isMetaMaskInstalled()) {
      this.snackbar.sendInfo(Web3Errors.INSTALL_METAMASK);
      return;
    }

    if (this.model.isProviderConnected()) {
      return;
    }

    await this.requestAccounts();
  };

  private requestAccounts = async () => {
    try {
      const accounts = await this.ethereum.requestAccounts();
      console.log("[web3]:requestAccounts:accounts", accounts);

      await this.updateAccounts(accounts);
    } catch (error) {
      console.log("[web3]:requestAccounts:error", error);

      if (!isRpcError(error)) {
        this.snackbar.sendError(Web3Errors.SOMETHING_WENT_WRONG);
        return;
      }

      switch (error.code) {
        case RpcErrors.REQUEST_ALREADY_PENDING:
          this.snackbar.sendInfo(Web3Errors.REQUEST_ALREADY_PENDING);
          break;
        case RpcErrors.USER_REJECTED_REQUEST:
          this.snackbar.sendInfo(Web3Errors.REQUEST_REJECTED);
          break;
        default:
          this.snackbar.sendError(Web3Errors.CONNECT_METAMASK);
          break;
      }
    }
  };

  private ethAccounts = async () => {
    try {
      const accounts = await this.ethereum.ethAccounts();
      console.log("[web3]:eth_accounts", accounts);

      await this.updateAccounts(accounts);
    } catch (error) {
      console.log("[web3]:eth_accounts:error", error);
    }
  };

  private handleAccountsChange = async (accounts: string[]) => {
    console.log("[web3]:handleAccountsChange", accounts);
    // TODO when accounts change, we should update NFT states of owners, etc
    await this.updateAccounts(accounts);
    // TODO in ext - we need to also map account to user
    this.model.resetEthBalance();
  };

  private updateAccounts = async (accounts: string[]) => {
    this.model.setAccounts(accounts);
    const address = this.model.getAccount();
    if (!address) {
      return;
    }

    this.model.setConnected();

    const name = await this.ethereum.resolveEnsName(address);
    this.model.setEnsName(name);
  };

  private handleChainChanged(chainId: ChainId) {
    console.log("[web3]::chainChanged", chainId);
    window.location.reload();
  }

  private get ethereum() {
    if (this.ethClient) {
      return this.ethClient;
    }

    this.ethClient = this.ethClientCreator(window.ethereum as EthereumProvider);
    this.ethClient.registerEventHandler("chainChanged", this.handleChainChanged);
    this.ethClient.registerEventHandler("accountsChanged", this.handleAccountsChange);
    return this.ethClient;
  }
}
