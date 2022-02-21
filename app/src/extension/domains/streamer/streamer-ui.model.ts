import { makeAutoObservable } from "mobx";
import { MetaModel } from "../../../domains/app/meta.model";

export interface IStreamerUiModel {
  meta: MetaModel;
}

type StreamerPage = "MISSING_PROVIDER" | "INPUT" | "CLIP" | "NFT";

export class StreamerUiModel implements IStreamerUiModel {
  meta: MetaModel;
  page: StreamerPage = "MISSING_PROVIDER";

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setPage(page: StreamerPage) {
    this.page = page;
  }
}
