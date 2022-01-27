import { BigNumberish } from "ethers";
import { makeAutoObservable } from "mobx";

import { pinataGatewayUri } from "../../lib/constants";
import { formatCurrencyAmountToDisplayAmount } from "../../lib/ethereum/currency";
import {
  AuctionBidPartialFragment,
  AuctionPartialFragment,
  BidPartialFragment,
  CurrencyPartialFragment,
  InactiveAuctionBidPartialFragment,
  ReserveAuctionBidType,
  ReserveAuctionStatus,
} from "../../lib/graphql/types";
import { calcExpectedEndOfAuction, formatTimestampToCountdown } from "../../lib/time/time";
import { MetaModel } from "../app/meta.model";

export class NftModel {
  meta: MetaModel;

  metadata: Metadata[] = [];
  hasMetadata: { [tokenId: string]: boolean } = {};

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  addMetadata(data: MetadataInput): void {
    if (this.hasMetadata[data.tokenId]) {
      return;
    }
    this.metadata.push(new Metadata(data));
    this.hasMetadata[data.tokenId] = true;
  }

  updateTokenAuction(tokenId: string, auction: AuctionPartialFragment): void {
    const metadata = this.getTokenMetadata(tokenId);
    metadata.auction = new Auction(auction, metadata.owner);
  }

  resetMetadata(): void {
    this.metadata = [];
    this.hasMetadata = {};
  }

  getMetadata(clipCid: string): Metadata {
    return this.metadata.filter((metadata) => metadata.clipCid === clipCid)[0];
  }

  getTokenMetadata(tokenId: string): Metadata {
    return this.metadata.filter((metadata) => metadata.tokenId === tokenId)[0];
  }

  getOwnMetadata(userAddress: string | null): Metadata[] {
    return this.metadata.filter(
      (metadata) => metadata.owner === userAddress || metadata.auction?.tokenOwnerId === userAddress
    );
  }

  get metadataForMarketplace(): Metadata[] {
    return this.metadata.filter((metadata) => {
      if (metadata.auction) {
        return metadata.auction.approved && !metadata.auction.isCanceled;
      }
      return false; // for now do not display tokens without auction in marketplace
    });
  }
}

interface MetadataInput {
  clipCid: string;
  name: string;
  description: string;
  metadataCid: string;
  tokenId: string;
  thumbnailUri: string;
  owner: string;
  currentBids?: BidPartialFragment[] | null;
  reserveAuction?: AuctionPartialFragment[] | null;
}

export class Metadata {
  clipTitle: string;
  clipCid: string;
  description: string;
  clipIpfsUri: string;
  metadataCid: string;
  tokenId: string;
  thumbnailUri: string;
  owner: string;
  auction: Auction | null;

  constructor(data: MetadataInput, private ipfsGatewayUri: string = pinataGatewayUri) {
    makeAutoObservable(this);

    this.clipCid = this.validateField(data.clipCid);
    this.clipTitle = this.validateField(data.name);
    this.description = this.validateField(data.description);
    this.clipIpfsUri = this.createClipIpfsGatewayUri(this.clipCid);
    this.metadataCid = this.validateField(data.metadataCid);
    this.tokenId = this.validateField(data.tokenId);
    this.thumbnailUri = this.validateField(data.thumbnailUri);
    this.owner = this.validateField(data.owner);
    this.auction = this.handleLatestAuction(this.tokenId, this.owner, data.reserveAuction);
  }

  private validateField<T>(field: unknown) {
    if (typeof field === "undefined") {
      throw new Error(`Undefined metadata field type: ${field}`);
    }
    return field as T;
  }

  private createClipIpfsGatewayUri = (cid: string) => {
    return `${this.ipfsGatewayUri}/${cid}`;
  };

  private handleLatestAuction(tokenId: string, tokenOwner: string, auction?: AuctionPartialFragment[] | null) {
    if (!auction || auction.length === 0) {
      return null;
    }

    const a = auction.filter((ah) => ah.tokenId === tokenId).reduce((max, au) => (max.id > au.id ? max : au));
    return new Auction(a, tokenOwner);
  }
}

export class Bid {
  symbol: string;
  amount: BigNumberish;
  displayAmount: string;
  bidderAddress: string;
  bidType: ReserveAuctionBidType;

  constructor(data: {
    symbol: string;
    amount: BigNumberish;
    decimals?: number | null;
    bidder: string;
    bidType: ReserveAuctionBidType;
  }) {
    this.symbol = data.symbol;
    this.amount = data.amount;
    this.displayAmount = formatCurrencyAmountToDisplayAmount(this.amount, data.decimals);
    this.bidderAddress = data.bidder;
    this.bidType = data.bidType;
  }
}

export class Auction {
  id: string;
  tokenId: string;
  approved: boolean;
  status: ReserveAuctionStatus;
  tokenOwnerId: string;
  duration: string;
  firstBidTime?: string;
  approvedTimestamp?: string;
  reservePrice: string;
  displayReservePrice: string;
  expectedEndTimestamp?: string | null;
  auctionCurrency: CurrencyPartialFragment;
  highestBid: Bid | null;
  previousBids: Bid[];
  previousHighestBid: Bid | null;

  constructor(input: AuctionPartialFragment, tokenOwner: string) {
    makeAutoObservable(this);

    this.id = input.id;
    this.tokenId = input.tokenId;
    this.approved = input.approved;
    this.duration = input.duration;
    this.firstBidTime = input.firstBidTime;
    this.approvedTimestamp = input.approvedTimestamp;
    this.expectedEndTimestamp = input.expectedEndTimestamp;
    this.reservePrice = input.reservePrice;
    this.displayReservePrice = formatCurrencyAmountToDisplayAmount(
      input.reservePrice ?? 0,
      input.auctionCurrency.decimals
    );
    this.status = input.status;
    this.tokenOwnerId = this.handleTokenOwnerId(input.tokenOwner.id, tokenOwner);
    this.auctionCurrency = input.auctionCurrency;
    this.highestBid = this.handleHighestBid(this.auctionCurrency, input.currentBid);
    this.previousBids = this.handlePreviousBids(this.auctionCurrency, input.previousBids);
    this.previousHighestBid = this.handlePreviousHighestBid(input.previousBids);
  }

  get isActive(): boolean {
    return this.status === ReserveAuctionStatus.Active;
  }

  get isPending(): boolean {
    return this.status === ReserveAuctionStatus.Pending;
  }

  get isCanceled(): boolean {
    return this.status === ReserveAuctionStatus.Canceled;
  }

  get isFinished(): boolean {
    return this.status === ReserveAuctionStatus.Finished;
  }

  get displayAuctionStatus(): DisplayAuctionStatus {
    return new DisplayAuctionStatus(this);
  }

  get displayBid(): {
    symbol: string;
    displayAmount: string;
    onlyDisplayReservePrice: boolean;
  } {
    // display bid priority: current highest bid > finished bid from previous auction > reserve price
    if (this.isActive && this.highestBid) {
      return { ...this.highestBid, onlyDisplayReservePrice: false };
    }

    if (this.isFinished && this.previousHighestBid) {
      return { ...this.previousHighestBid, onlyDisplayReservePrice: false };
    }

    return {
      symbol: this.auctionCurrency.symbol,
      displayAmount: this.displayReservePrice,
      onlyDisplayReservePrice: true,
    };
  }

  private handleTokenOwnerId(auctionTokenOwnerId: string, tokenOwner: string) {
    // auction.tokenOwnerId can be correct token owner,
    // or outdated token owner if auction is finished (subgraph handler does not update tokenOwnerId on auction ended event)
    return this.isFinished ? tokenOwner : auctionTokenOwnerId;
  }

  private handleHighestBid(c: CurrencyPartialFragment, bid?: AuctionBidPartialFragment | null) {
    if (!bid?.amount) {
      return null;
    }

    return new Bid({
      symbol: c.symbol,
      amount: bid.amount,
      decimals: c.decimals,
      bidder: bid.bidder.id,
      bidType: bid.bidType,
    });
  }

  private handlePreviousBids(c: CurrencyPartialFragment, bids?: InactiveAuctionBidPartialFragment[] | null) {
    if (!bids) {
      return [];
    }

    return bids.map(
      (bid) =>
        new Bid({
          symbol: c.symbol,
          amount: bid.amount,
          decimals: c.decimals,
          bidder: bid.bidder.id,
          bidType: bid.bidType,
        })
    );
  }

  private handlePreviousHighestBid(bids?: InactiveAuctionBidPartialFragment[] | null) {
    if (!bids) {
      return null;
    }
    // find highest previous bid based on bidType & bidInactivatedTs
    const finalBids = bids.filter((b) => b.bidType === ReserveAuctionBidType.Final);
    if (finalBids.length === 0) {
      return null;
    }

    const highestBid = finalBids[0];
    return new Bid({
      symbol: this.auctionCurrency.symbol,
      amount: highestBid.amount,
      decimals: this.auctionCurrency.decimals,
      bidder: highestBid.bidder.id,
      bidType: highestBid.bidType,
    });
  }
}

export enum DisplayAuctionStatusTitle {
  READY = "Auction ready",
  ENDED = "Auction ended",
  ENDS_IN = "Auction ends in:",
  NOT_APPROVED = "Auction not approved yet",
  SOLD = "Sold for:",
  EMPTY = "",
}

export class DisplayAuctionStatus {
  title: DisplayAuctionStatusTitle;
  value: string;

  constructor(auction: Auction) {
    makeAutoObservable(this);

    const { title, value } = this.getAuctionStatus(
      auction.status,
      `${auction.previousHighestBid?.displayAmount} ${auction.previousHighestBid?.symbol}`,
      auction.firstBidTime,
      auction.expectedEndTimestamp
    );
    this.title = title;
    this.value = value;
  }

  private getAuctionStatus(
    status: ReserveAuctionStatus | null | undefined,
    highestBidDisplayValue: string,
    firstBidTime?: string,
    expectedEndTimestamp?: string | null
  ): { title: DisplayAuctionStatusTitle; value: string } {
    switch (status) {
      case ReserveAuctionStatus.Pending:
        return { title: DisplayAuctionStatusTitle.NOT_APPROVED, value: "" };
      case ReserveAuctionStatus.Active: {
        if (!firstBidTime || firstBidTime === "0") {
          // no bids yet, but active (approved) auction
          return { title: DisplayAuctionStatusTitle.READY, value: "" };
        }

        const countdown = formatTimestampToCountdown(calcExpectedEndOfAuction(expectedEndTimestamp));
        if (!countdown) {
          return { title: DisplayAuctionStatusTitle.ENDED, value: "" };
        }

        return { title: DisplayAuctionStatusTitle.ENDS_IN, value: countdown };
      }
      case ReserveAuctionStatus.Finished:
        return {
          title: DisplayAuctionStatusTitle.SOLD,
          value: highestBidDisplayValue,
        };
      case ReserveAuctionStatus.Canceled:
      default:
        return { title: DisplayAuctionStatusTitle.EMPTY, value: "" };
    }
  }
}
