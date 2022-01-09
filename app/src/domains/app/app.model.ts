import { ClipModel } from "../twitch-clips/clip.model";
import { GameModel } from "../twitch-games/game.model";
import { MetaModel } from "./meta.model";
import { NftModel } from "../nfts/nft.model";
import { SnackbarModel } from "../snackbar/snackbar.model";
import { TestStore } from "../playground/playground.store";
import { UserModel } from "../twitch-user/user.model";
import { OAuthModel } from "../twitch-oauth/oauth.model";
import { Web3Model } from "../web3/web3.model";


export interface IAppModel {
  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  web3: Web3Model;

  auth: OAuthModel;
  snackbar: SnackbarModel;

  testStore: TestStore;

}

export class AppModel implements IAppModel {
  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  snackbar: SnackbarModel;
  auth: OAuthModel;
  web3: Web3Model;

  testStore: TestStore;


  constructor() {
    this.clip = new ClipModel(new MetaModel());
    this.user = new UserModel(new MetaModel());
    this.game = new GameModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.web3 = new Web3Model(new MetaModel());
    this.auth = new OAuthModel(new MetaModel());

    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}
