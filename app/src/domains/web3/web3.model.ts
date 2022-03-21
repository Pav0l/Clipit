import { BigNumber } from "ethers";
import { makeAutoObservable } from "mobx";
import { formatCurrencyAmountToDisplayAmount } from "../../lib/ethereum/currency";
import { truncate } from "../../lib/strings/truncate";
import { MetaModel } from "../app/meta.model";

export class Web3Model {
  meta: MetaModel;

  walletStatus: WalletStatus = WalletStatus.INSTALL;
  accounts: string[] = [];
  balance?: BigNumber;
  displayBalance?: string;
  ensName: string | null = null;
  chainId?: string;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  get connectStatus(): string {
    return this.ensName ? truncate(this.ensName, 10) : this.walletStatus;
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts.map((address) => address.toLowerCase());
  }

  setEnsName(name: string | null) {
    this.ensName = name;
  }

  setChainId(chainId: string) {
    this.chainId = chainId;
  }

  setEthBalance(value: BigNumber) {
    this.balance = value;
    this.displayBalance = formatCurrencyAmountToDisplayAmount(this.balance);
  }

  resetEthBalance() {
    this.balance = undefined;
    this.displayBalance = undefined;
  }

  getAccount(): string | null {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  isProviderConnected(): boolean {
    return this.accounts.length > 0;
  }

  isMetaMaskInstalled(): boolean {
    return Boolean(window.ethereum && window.ethereum.isMetaMask);
  }

  setConnected() {
    this.setWalletStatus(WalletStatus.CONNECTED);
  }

  setConnect() {
    this.setWalletStatus(WalletStatus.CONNECT);
  }

  private setWalletStatus(status: WalletStatus) {
    this.walletStatus = status;
  }
}

export enum Web3Errors {
  INSTALL_METAMASK = "Please install MetaMask extension and click the Connect button to view or create Clip NFTs",
  CONNECT_METAMASK = "Connect your MetaMask wallet to view or create Clip NFTs",
  REQUEST_REJECTED = "Request to connect MetaMask was rejected",

  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",

  SOMETHING_WENT_WRONG = "Something went wrong",
}

export enum WalletStatus {
  INSTALL = "Install MetaMask",
  CONNECT = "Connect",
  CONNECTED = "Connected",
}
