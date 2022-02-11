import { BigNumber } from "ethers";
import { makeAutoObservable } from "mobx";
import { formatCurrencyAmountToDisplayAmount } from "../../lib/ethereum/currency";
import { MetaModel } from "../app/meta.model";

export enum MintStatus {
  CONFIRM_MINT = "Clip ready to be turned into an NFT! Please confirm the transaction in MetaMask",
  WAIT_FOR_MINT_TX = "Clip minted, waiting for the transaction to confirm...",
}

enum StoreClipStatus {
  PREPARING_CLIP = "Preparing your clip, this may take some time. Please do not refresh the page.",
  GENERATING_SIG = "Almost there, generating a signature for your clip...",
}

export enum AuctionLoadStatus {
  APPROVE_TOKEN = "Approving Auction contract to work with your NFT. Please confirm the transaction in Metamask",
  WAIT_FOR_APPROVE_TOKEN_TX = "Auction contract approved, waiting for the transaction to confirm...",
  CONFIRM_CREATE_AUCTION = "Auction ready to be created. Please confirm the transaction in Metamask",
  WAIT_FOR_AUCTION_CREATE_TX = "Auction created, waiting for the transaction to confirm...",
  CREATE_AUCTION_SUCCESS = "Auction created successfully",
}

export enum AuctionBidLoadStatus {
  CONFIRM_AUCTION_BID = "Bid ready to be created. Please confirm the transaction in Metamask",
  WAIT_FOR_AUCTION_BID_TX = "Bid created, waiting for the transaction to confirm...",
  AUCTION_BID_SUCCESS = "Bid created successfully",
}

export enum AuctionCancelLoadStatus {
  CONFIRM_AUCTION_CANCEL = "Transaction ready to be created. Please confirm it in Metamask",
  WAIT_FOR_AUCTION_CANCEL_TX = "Auction canceled, waiting for the transaction to confirm...",
  AUCTION_CANCEL_SUCCESS = "Auction canceled successfully",
}

export enum AuctionEndLoadStatus {
  CONFIRM_AUCTION_END = "Transaction ready to be created. Please confirm it in Metamask",
  WAIT_FOR_AUCTION_END_TX = "Auction ended, waiting for the transaction to confirm...",
  AUCTION_END_SUCCESS = "Auction ended successfully",
}

export class Web3Model {
  meta: MetaModel;

  accounts: string[] = [];
  balance?: BigNumber;
  displayBalance?: string;
  chainId?: string;

  // Saving clip & generating signature loader
  storeClipStatus?: StoreClipStatus;
  private storeClipTimeoutId?: number;
  // Minting NFT loader
  mintStatus?: MintStatus;
  // Auction loader
  auctionLoadStatus?: AuctionLoadStatus;
  // Bid on auction loader
  auctionBidLoadStatus?: AuctionBidLoadStatus;
  // cancel auction loader
  auctionCancelLoadStatus?: AuctionCancelLoadStatus;
  // end auction loader
  auctionEndLoadStatus?: AuctionEndLoadStatus;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setAccounts(accounts: string[]) {
    this.accounts = accounts.map((address) => address.toLowerCase());
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

  startClipStoreLoader() {
    this.setClipStoreStatus(StoreClipStatus.PREPARING_CLIP);

    const timeoutId = window.setTimeout(() => {
      this.setClipStoreStatus(StoreClipStatus.GENERATING_SIG);
    }, 20_000);

    this.setStoreClipTimeoutId(timeoutId);
  }

  stopClipStoreLoaderAndStartMintLoader() {
    this.stopClipStoreLoader();
    this.startMintLoader();
  }

  stopMintLoader() {
    this.mintStatus = undefined;
  }

  setWaitForMintTx() {
    this.mintStatus = MintStatus.WAIT_FOR_MINT_TX;
  }

  setAuctionApproveTokenLoader() {
    this.setAuctionLoadStatus(AuctionLoadStatus.APPROVE_TOKEN);
  }

  setWaitForApproveTxLoader() {
    this.setAuctionLoadStatus(AuctionLoadStatus.WAIT_FOR_APPROVE_TOKEN_TX);
  }

  setAuctionCreateLoader() {
    this.setAuctionLoadStatus(AuctionLoadStatus.CONFIRM_CREATE_AUCTION);
  }

  setWaitForAuctionCreateTxLoader() {
    this.setAuctionLoadStatus(AuctionLoadStatus.WAIT_FOR_AUCTION_CREATE_TX);
  }

  clearAuctionLoader() {
    this.setAuctionLoadStatus(undefined);
  }

  setAuctionBidLoader() {
    this.setAuctionBidLoadStatus(AuctionBidLoadStatus.CONFIRM_AUCTION_BID);
  }

  setWaitForAuctionBidTxLoader() {
    this.setAuctionBidLoadStatus(AuctionBidLoadStatus.WAIT_FOR_AUCTION_BID_TX);
  }

  clearAuctionBidLoader() {
    this.setAuctionBidLoadStatus(undefined);
  }

  setAuctionCancelLoader() {
    this.setAuctionCancelLoadStatus(AuctionCancelLoadStatus.CONFIRM_AUCTION_CANCEL);
  }

  setWaitForAuctionCancelTxLoader() {
    this.setAuctionCancelLoadStatus(AuctionCancelLoadStatus.WAIT_FOR_AUCTION_CANCEL_TX);
  }

  clearAuctionCancelLoader() {
    this.setAuctionCancelLoadStatus(undefined);
  }

  setAuctionEndLoader() {
    this.setAuctionEndLoadStatus(AuctionEndLoadStatus.CONFIRM_AUCTION_END);
  }

  setWaitForAuctionEndTxLoader() {
    this.setAuctionEndLoadStatus(AuctionEndLoadStatus.WAIT_FOR_AUCTION_END_TX);
  }

  clearAuctionEndLoader() {
    this.setAuctionEndLoadStatus(undefined);
  }

  stopClipStoreLoader() {
    clearTimeout(this.storeClipTimeoutId);
    this.setStoreClipTimeoutId(undefined);
    this.storeClipStatus = undefined;
  }

  private setStoreClipTimeoutId(value: number | undefined) {
    this.storeClipTimeoutId = value;
  }

  private startMintLoader() {
    this.mintStatus = MintStatus.CONFIRM_MINT;
  }

  private setClipStoreStatus(status: StoreClipStatus) {
    this.storeClipStatus = status;
  }

  private setAuctionLoadStatus(status: AuctionLoadStatus | undefined) {
    this.auctionLoadStatus = status;
  }

  private setAuctionBidLoadStatus(status: AuctionBidLoadStatus | undefined) {
    this.auctionBidLoadStatus = status;
  }

  private setAuctionCancelLoadStatus(status: AuctionCancelLoadStatus | undefined) {
    this.auctionCancelLoadStatus = status;
  }

  private setAuctionEndLoadStatus(status: AuctionEndLoadStatus | undefined) {
    this.auctionEndLoadStatus = status;
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

  FAILED_TO_FETCH_SUBGRAPH_DATA = "There was an issue fetching your NFT data. The NFT was minted, however it may take some time to update the data. Please check your list of NFTs in couple of minutes",

  REQUEST_ALREADY_PENDING = "Request already pending. Please open your MetaMask wallet and confirm it",

  SOMETHING_WENT_WRONG = "Something went wrong",
}

export enum MetamaskButton {
  INSTALL = "Install MetaMask",
  CONNECT = "Connect",
  CONNECTED = "Connected",
}
