import { ClipModel } from "../twitch-clips/clip.model";
import { GameModel } from "../twitch-games/game.model";
import { MetaModel } from "./meta.model";
import { NftModel } from "../nfts/nft.model";
import { SnackbarModel } from "../../lib/snackbar/snackbar.model";
import { TestStore } from "../playground/playground.store";
import { UserModel } from "../twitch-user/user.model";


export interface AppModel {
  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;

  snackbar: SnackbarModel;

  testStore: TestStore;

}

class Model implements AppModel {
  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  snackbar: SnackbarModel;

  testStore: TestStore;


  constructor() {
    this.clip = new ClipModel(new MetaModel());
    this.user = new UserModel(new MetaModel());
    this.game = new GameModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}

export const appModel = new Model();
