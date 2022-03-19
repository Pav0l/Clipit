import { makeAutoObservable } from "mobx";
import { MetaModel } from "../../../domains/app/meta.model";
import { MintModel } from "../../../domains/mint/mint.model";
import { NftModel } from "../../../domains/nfts/nft.model";
import { SnackbarModel } from "../../../domains/snackbar/snackbar.model";
import { ClipModel } from "../../../domains/twitch-clips/clip.model";
import { GameModel } from "../../../domains/twitch-games/game.model";
import { UserModel } from "../../../domains/twitch-user/user.model";
import { Web3Model } from "../../../domains/web3/web3.model";
import { ConfigUiModel } from "../config/config-ui.model";
import { StreamerUiModel } from "../streamer/streamer-ui.model";
import { ExtensionMode } from "./extension.interfaces";

export interface IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;

  web3: Web3Model;
  nft: NftModel;
  clip: ClipModel;
  game: GameModel;
  user: UserModel;
  snackbar: SnackbarModel;
  streamerUi: StreamerUiModel;
  configUi: ConfigUiModel;
  mint: MintModel;
}

export class ExtensionModel implements IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;
  web3: Web3Model;
  nft: NftModel;
  clip: ClipModel;
  game: GameModel;
  user: UserModel;
  streamerUi: StreamerUiModel;
  configUi: ConfigUiModel;
  mint: MintModel;

  snackbar: SnackbarModel;

  constructor(mode: ExtensionMode) {
    makeAutoObservable(this);
    this.meta = new MetaModel();
    this.mode = mode;

    this.web3 = new Web3Model(new MetaModel());
    this.clip = new ClipModel(new MetaModel());
    this.game = new GameModel(new MetaModel());
    this.user = new UserModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.streamerUi = new StreamerUiModel(new MetaModel());
    this.configUi = new ConfigUiModel(new MetaModel());
    this.snackbar = new SnackbarModel();
    this.mint = new MintModel();
  }
}
