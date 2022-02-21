import { makeAutoObservable } from "mobx";
import { MetaModel } from "../../../domains/app/meta.model";
import { NftModel } from "../../../domains/nfts/nft.model";
import { SnackbarModel } from "../../../domains/snackbar/snackbar.model";
import { ClipModel } from "../../../domains/twitch-clips/clip.model";
import { Web3Model } from "../../../domains/web3/web3.model";
import { StreamerUiModel } from "../streamer/streamer-ui.model";
import { ExtensionMode } from "./extension.interfaces";

export interface IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;

  web3: Web3Model;
  nft: NftModel;
  clip: ClipModel;
  snackbar: SnackbarModel;
  streamerUi: StreamerUiModel;
}

export class ExtensionModel implements IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;
  web3: Web3Model;
  nft: NftModel;
  clip: ClipModel;
  streamerUi: StreamerUiModel;

  snackbar: SnackbarModel;

  constructor(mode: ExtensionMode) {
    makeAutoObservable(this);
    this.meta = new MetaModel();
    this.mode = mode;

    this.web3 = new Web3Model(new MetaModel());
    this.clip = new ClipModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.streamerUi = new StreamerUiModel(new MetaModel());
    this.snackbar = new SnackbarModel();
  }
}
