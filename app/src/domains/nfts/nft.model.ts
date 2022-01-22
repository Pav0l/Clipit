import { BigNumberish } from "ethers";
import { makeAutoObservable } from "mobx"

import { pinataGatewayUri } from "../../lib/constants";
import { formatCurrencyAmountToDisplayAmount } from "../../lib/ethereum/currency";
import { AuctionBidPartialFragment, AuctionPartialFragment, BidPartialFragment, CurrencyPartialFragment, ReserveAuctionStatus } from "../../lib/graphql/types";
import { calcExpectedEndOfAuction } from "../../lib/time/time";
import { MetaModel } from "../app/meta.model";


export class NftModel {
  meta: MetaModel;

  metadata: Metadata[] = [];
  hasMetadata: { [tokenId: string]: boolean } = {}

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
    metadata.auction = new Auction(auction);
  }

  resetMetadata(): void {
    this.metadata = [];
    this.hasMetadata = {};
  }

  getMetadata(clipCid: string): Metadata {
    return this.metadata.filter(metadata => metadata.clipCid === clipCid)[0];
  }

  getTokenMetadata(tokenId: string): Metadata {
    return this.metadata.filter(metadata => metadata.tokenId === tokenId)[0];
  }

  getOwnMetadata(userAddress: string | null): Metadata[] {
    return this.metadata.filter(metadata => metadata.owner === userAddress || metadata.auction?.tokenOwnerId === userAddress);
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
  currentBids: ActiveBid[];
  currentBid?: ActiveBid;
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
    this.currentBids = this.handleBids(data.currentBids);
    this.currentBid = this.currentBids && this.currentBids.length > 0
      ? this.currentBids[0]
      : undefined
    this.auction = this.handleAuction(this.tokenId, data.reserveAuction);
  }

  private handleBids(bids?: BidPartialFragment[] | null) {
    if (!bids || bids.length === 0) {
      return [];
    }

    return bids.map(bid => new ActiveBid({ symbol: bid.currency.symbol, amount: bid.amount, decimals: bid.currency.decimals, bidder: bid.bidder.id }))
  }

  private validateField<T>(field: unknown) {
    if (typeof field === 'undefined') {
      throw new Error(`Undefined metadata field type: ${field}`);
    }
    return field as T;
  }

  private createClipIpfsGatewayUri = (cid: string) => {
    return `${this.ipfsGatewayUri}/${cid}`;
  }

  private handleAuction(tokenId: string, auction?: AuctionPartialFragment[] | null) {
    if (!auction || auction.length === 0) {
      return null;
    }

    const a = auction.filter(ah => ah.tokenId === tokenId)[0];
    return new Auction(a)
  }
}

export class ActiveBid {
  symbol: string;
  amount: BigNumberish;
  displayAmount: string;
  bidderAddress: string;

  constructor(data: { symbol: string; amount: BigNumberish; decimals?: number | null; bidder: string }) {
    this.symbol = data.symbol;
    this.amount = data.amount;
    this.displayAmount = formatCurrencyAmountToDisplayAmount(this.amount, data.decimals);
    this.bidderAddress = data.bidder;
  }
}

class Auction {
  id: string;
  tokenId: string;
  approved: boolean;
  private xstatus: CustomAuctionStatus;
  tokenOwnerId: string;
  duration: string;
  firstBidTime?: string;
  approvedTimestamp?: string;
  reservePrice: string;
  displayReservePrice: string;
  expectedEndTimestamp?: string | null;
  auctionCurrency: CurrencyPartialFragment;
  highestBid: ActiveBid | null;

  constructor(input: AuctionPartialFragment) {
    makeAutoObservable(this);

    this.id = input.id;
    this.tokenId = input.tokenId;
    this.approved = input.approved;
    this.duration = input.duration;
    this.firstBidTime = input.firstBidTime;
    this.approvedTimestamp = input.approvedTimestamp;
    this.expectedEndTimestamp = input.expectedEndTimestamp;
    this.reservePrice = input.reservePrice;
    this.displayReservePrice = formatCurrencyAmountToDisplayAmount(input.reservePrice ?? 0, input.auctionCurrency.decimals);
    this.xstatus = this.mapAuctionStatus(input.status);
    this.tokenOwnerId = input.tokenOwner.id;
    this.auctionCurrency = input.auctionCurrency;
    this.highestBid = this.handleHighestBid(this.auctionCurrency, input.currentBid);
  }

  get isActive(): boolean {
    return this.status === CustomAuctionStatus.Active;
  }

  get status(): CustomAuctionStatus | undefined {
    const isActiveStatus = this.xstatus === CustomAuctionStatus.Active;
    if (!isActiveStatus) {
      return this.xstatus;
    }

    // status can be active, but auction could have timed out already
    const timeToEnd = calcExpectedEndOfAuction(this.approvedTimestamp, this.duration, this.expectedEndTimestamp);
    if (isNaN(timeToEnd)) {
      return CustomAuctionStatus.Pending;
    }

    if (timeToEnd <= 0) {
      return CustomAuctionStatus.Timeout;
    }

    return CustomAuctionStatus.Active;
  }

  private handleHighestBid(c?: CurrencyPartialFragment, bid?: AuctionBidPartialFragment | null) {
    if (!c?.symbol) {
      return null;
    }
    if (!bid?.amount) {
      return null;
    }

    return new ActiveBid({ symbol: c.symbol, amount: bid.amount, decimals: c.decimals, bidder: bid.bidder.id });
  }

  private mapAuctionStatus(status: ReserveAuctionStatus): CustomAuctionStatus {
    switch (status) {
      case ReserveAuctionStatus.Active:
        return CustomAuctionStatus.Active;
      case ReserveAuctionStatus.Canceled:
        return CustomAuctionStatus.Canceled;
      case ReserveAuctionStatus.Finished:
        return CustomAuctionStatus.Finished;
      case ReserveAuctionStatus.Pending:
        return CustomAuctionStatus.Pending;
    }
  }
}

// same as ReserveAuctionStatus, but includes Timeout status
// which happens when Active auctions duration ran out, but the contract doesn't know about it yet
export enum CustomAuctionStatus {
  Active = 'Active',
  Canceled = 'Canceled',
  Finished = 'Finished',
  Pending = 'Pending',
  Timeout = 'Timeout'
}
