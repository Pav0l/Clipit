import { makeAutoObservable } from "mobx";
import { MetaModel } from "../../../domains/app/meta.model";

export interface IStreamerUiModel {
  meta: MetaModel;
}

type StreamerPage = "MISSING_PROVIDER" | "INPUT" | "CLIP" | "NFT" | "AUCTION";

export class StreamerUiModel implements IStreamerUiModel {
  meta: MetaModel;
  page: StreamerPage = "MISSING_PROVIDER";

  clipId?: string;
  tokenId?: string;
  auctionId?: string;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  goToMissingProvider() {
    this.clearIds();
    this.setPage("MISSING_PROVIDER");
  }

  goToInput() {
    this.clearIds();
    this.setPage("INPUT");
  }

  goToClip(clipId: string) {
    this.clipId = clipId;
    this.tokenId = undefined;
    this.auctionId = undefined;
    this.setPage("CLIP");
  }

  goToNft(tokenId: string) {
    this.tokenId = tokenId;
    this.auctionId = undefined;
    this.setPage("NFT");
  }

  goToAuction(auctionId: string) {
    this.auctionId = auctionId;
    this.setPage("AUCTION");
  }

  private setPage(page: StreamerPage) {
    this.page = page;
  }

  private clearIds() {
    this.clipId = undefined;
    this.tokenId = undefined;
    this.auctionId = undefined;
  }
}
