import { ClipsStore } from "../domains/twitch-clips/clips.store";
import { GamesStore } from "./games.store";
import { MetaStore } from "./meta.store";
import { NftStore } from "../domains/nfts/nft.store";
import { SnackbarModel } from "../domains/snackbar/snackbar.model";
import { TestStore } from "../modules/playground/playground.store";
import { UserStore } from "./user.store";


export interface IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;

  snackbar: SnackbarModel;

  testStore: TestStore;

}

class Store implements IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;
  snackbar: SnackbarModel;

  testStore: TestStore;


  constructor() {
    this.clipsStore = new ClipsStore(new MetaStore());
    this.userStore = new UserStore(new MetaStore());
    this.gameStore = new GamesStore(new MetaStore());
    this.nftStore = new NftStore(new MetaStore());
    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}

export const store = new Store();
