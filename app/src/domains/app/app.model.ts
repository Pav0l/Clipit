import { ClipsStore } from "../twitch-clips/clips.store";
import { GameModel } from "../twitch-games/game.model";
import { MetaModel } from "./meta.model";
import { NftModel } from "../nfts/nft.model";
import { SnackbarModel } from "../../lib/snackbar/snackbar.model";
import { TestStore } from "../playground/playground.store";
import { UserModel } from "../twitch-user/user.model";


export interface AppModel {
  clipsStore: ClipsStore;
  user: UserModel;
  game: GameModel;
  nft: NftModel;

  snackbar: SnackbarModel;

  testStore: TestStore;

}

class Model implements AppModel {
  clipsStore: ClipsStore;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  snackbar: SnackbarModel;

  testStore: TestStore;


  constructor() {
    this.clipsStore = new ClipsStore(new MetaModel());
    this.user = new UserModel(new MetaModel());
    this.game = new GameModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}

export const appModel = new Model();
