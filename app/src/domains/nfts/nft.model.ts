import { BigNumberish, utils } from "ethers";
import { makeAutoObservable } from "mobx"

import { pinataGatewayUri } from "../../lib/constants";
import { BidPartialFragment } from "../../lib/graphql/types";
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
    return this.metadata.filter(metadata => metadata.owner === userAddress);
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
  currentBids?: ActiveBid[];

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
  }

  private handleBids(bids?: BidPartialFragment[] | null) {
    if (!bids || bids.length === 0) {
      return [];
    }

    return bids.map(bid => new ActiveBid({ symbol: bid.currency.symbol, amount: bid.amount, decimals: bid.currency.decimals }))
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
}

export class ActiveBid {
  symbol: string;
  amount: BigNumberish;
  displayAmount: string;

  constructor(data: { symbol: string; amount: BigNumberish; decimals?: number | null }) {
    this.symbol = data.symbol;
    this.amount = data.amount;
    this.displayAmount = this.toDisplayAmount(this.amount, data.decimals);
  }

  private toDisplayAmount(amount: BigNumberish, decimals?: number | null): string {
    if (decimals === null) {
      decimals = undefined;
    }

    const formatedAmount = utils.formatUnits(amount, decimals);
    // handle float amounts
    const idxOfDot = formatedAmount.indexOf(".")
    // no dot -> no float -> just return
    if (idxOfDot === -1) return formatedAmount;
    // number has more than 6 digits, just return it without decimals
    if (idxOfDot > 6) return formatedAmount.substring(0, idxOfDot)
    // return up to 4 deimals
    return formatedAmount.substring(0, idxOfDot + 5)
  }
}
