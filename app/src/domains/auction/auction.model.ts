import { makeAutoObservable } from "mobx";
import { MetaModel } from "../meta/meta.model";

export enum AuctionErrors {
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

export enum ApproveAuctionStatus {
  APPROVE_TOKEN = "Approving Auction contract to work with your NFT. Please confirm the transaction in Metamask",
  WAIT_FOR_APPROVE_TOKEN_TX = "Auction contract approved, waiting for the transaction to confirm...",
}

export enum AuctionLoadStatus {
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

export class AuctionModel {
  meta: MetaModel;

  // Approve Auction loader
  approveAuctionStatus?: ApproveAuctionStatus;
  // Auction loader
  auctionLoadStatus?: AuctionLoadStatus;
  createAuctionTxHash?: string;

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

  setCreateAuctionTxHash(hash: string | undefined) {
    this.createAuctionTxHash = hash;
  }

  setApproveAuctionLoader = () => {
    this.setApproveAuctionStatus(ApproveAuctionStatus.APPROVE_TOKEN);
  };

  setWaitForApproveAuctionTxLoader = () => {
    this.setApproveAuctionStatus(ApproveAuctionStatus.WAIT_FOR_APPROVE_TOKEN_TX);
  };

  setAuctionCreateLoader = () => {
    this.clearAuctionApproveStatus();
    this.setAuctionLoadStatus(AuctionLoadStatus.CONFIRM_CREATE_AUCTION);
  };

  setWaitForAuctionCreateTxLoader = () => {
    this.setAuctionLoadStatus(AuctionLoadStatus.WAIT_FOR_AUCTION_CREATE_TX);
  };

  clearAuctionApproveStatus = () => {
    this.setApproveAuctionStatus(undefined);
  };

  clearAuctionLoader = () => {
    this.setAuctionLoadStatus(undefined);
  };

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

  private setAuctionLoadStatus(status: AuctionLoadStatus | undefined) {
    this.auctionLoadStatus = status;
  }

  private setApproveAuctionStatus(status: ApproveAuctionStatus | undefined) {
    this.approveAuctionStatus = status;
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
