import { ClipsStore } from "./clips.store";
import { GamesStore } from "./games.store";
import { MetaStore } from "./meta.store";
import { NftStore } from "./nft.store";
import { TestStore } from "./test.store";
import { UserStore } from "./user.store";


export interface IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;

  testStore: TestStore;

}

class Store implements IStore {
  clipsStore: ClipsStore;
  userStore: UserStore;
  gameStore: GamesStore;
  nftStore: NftStore;

  testStore: TestStore;


  constructor() {
    this.clipsStore = new ClipsStore(new MetaStore());
    this.userStore = new UserStore(new MetaStore());
    this.gameStore = new GamesStore(new MetaStore());
    this.nftStore = new NftStore(new MetaStore());

    this.testStore = new TestStore();
  }
}

export const store = new Store();
