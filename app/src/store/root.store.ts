import { ClipsStore } from "../domains/twitch-clips/clips.store";
import { GamesStore } from "./games.store";
import { MetaStore } from "./meta.store";
import { NftStore } from "../domains/nfts/nft.store";
import { SnackbarStore } from "../modules/snackbar/snackbar.store";
import { TestStore } from "../modules/playground/playground.store";
import { UserStore } from "./user.store";


export interface IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;

  snackbarStore: SnackbarStore;

  testStore: TestStore;

}

class Store implements IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;
  snackbarStore: SnackbarStore;

  testStore: TestStore;


  constructor() {
    this.clipsStore = new ClipsStore(new MetaStore());
    this.userStore = new UserStore(new MetaStore());
    this.gameStore = new GamesStore(new MetaStore());
    this.nftStore = new NftStore(new MetaStore());
    this.snackbarStore = new SnackbarStore();

    this.testStore = new TestStore();
  }
}

export const store = new Store();
