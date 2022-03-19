import { ClipModel } from "../twitch-clips/clip.model";
import { GameModel } from "../twitch-games/game.model";
import { MetaModel } from "./meta.model";
import { NftModel } from "../nfts/nft.model";
import { SnackbarModel } from "../snackbar/snackbar.model";
import { TestStore } from "../playground/playground.store";
import { UserModel } from "../twitch-user/user.model";
import { OAuthModel } from "../twitch-oauth/oauth.model";
import { Web3Model } from "../web3/web3.model";
import { NavigationModel } from "../navigation/navigation.model";
import { ThemeModel } from "../theme/theme.model";
import { MintModel } from "../mint/mint.model";
import { AuctionModel } from "../auction/auction.model";

export interface IAppModel {
  meta: MetaModel;
  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  web3: Web3Model;
  mint: MintModel;
  auction: AuctionModel;

  theme: ThemeModel;
  auth: OAuthModel;
  snackbar: SnackbarModel;
  navigation: NavigationModel;

  testStore: TestStore;
}

export class AppModel implements IAppModel {
  meta: MetaModel;

  clip: ClipModel;
  user: UserModel;
  game: GameModel;
  nft: NftModel;
  snackbar: SnackbarModel;
  auth: OAuthModel;
  web3: Web3Model;
  navigation: NavigationModel;
  theme: ThemeModel;
  mint: MintModel;
  auction: AuctionModel;

  testStore: TestStore;

  constructor() {
    this.meta = new MetaModel();

    this.clip = new ClipModel(new MetaModel());
    this.user = new UserModel(new MetaModel());
    this.game = new GameModel(new MetaModel());
    this.nft = new NftModel(new MetaModel());
    this.web3 = new Web3Model(new MetaModel());
    this.auth = new OAuthModel(new MetaModel());

    this.mint = new MintModel();
    this.auction = new AuctionModel();

    this.theme = new ThemeModel();
    this.navigation = new NavigationModel();
    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}
