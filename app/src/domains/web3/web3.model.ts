import { BigNumber } from "ethers";
import { makeAutoObservable } from "mobx";
import { formatCurrencyAmountToDisplayAmount } from "../../lib/ethereum/currency";
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
  CONNECT_MM_WARNING = "Request to connect MetaMask was rejected",

  FAILED_TO_MINT = "Failed to generate the NFT",
  MINT_REJECTED = "Mint transaction rejected",

  AUCTION_CREATE_REJECTED = "Transaction to create auction rejected",
  AUCTION_CREATE_FAILED = "Failed to create auction",

  AUCTION_BID_REJECTED = "Transaction to create auction bid rejected",
  AUCTION_BID_FAILED = "Failed to bid on auction",

  AUCTION_CANCEL_REJECTED = "Transaction to cancel auction rejected",
  AUCTION_CANCEL_FAILED = "Failed to cancel auction",

  AUCTION_END_REJECTED = "Transaction to end auction rejected",
  AUCTION_END_FAILED = "Failed to end auction",

  FAILED_TO_FETCH_SUBGRAPH_AUCTION_DATA = "There was an issue fetching your Auction data. Please check your Auctions in couple of minutes",

  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",

  SOMETHING_WENT_WRONG = "Something went wrong",
}

export enum WalletStatus {
  INSTALL = "Install MetaMask",
  CONNECT = "Connect",
  CONNECTED = "Connected",
}
