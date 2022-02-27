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
    this.setClipId(clipId);
    this.setTokenId(undefined);
    this.setAuctionId(undefined);
    this.setPage("CLIP");
  }

  goToNft(tokenId: string) {
    this.setTokenId(tokenId);
    this.setAuctionId(undefined);
    this.setPage("NFT");
  }

  goToAuction(auctionId: string) {
    this.setAuctionId(auctionId);
    this.setPage("AUCTION");
  }

  setTokenId(tokenId: string | undefined) {
    this.tokenId = tokenId;
  }

  setAuctionId(auctionId: string | undefined) {
    this.auctionId = auctionId;
  }

  setClipId(clipId: string | undefined) {
    this.clipId = clipId;
  }

  private setPage(page: StreamerPage) {
    this.page = page;
  }

  private clearIds() {
    this.setClipId(undefined);
    this.setTokenId(undefined);
    this.setAuctionId(undefined);
  }
}
