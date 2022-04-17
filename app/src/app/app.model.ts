import { ClipModel } from "../domains/twitch-clips/clip.model";
import { GameModel } from "../domains/twitch-games/game.model";
import { MetaModel } from "../domains/meta/meta.model";
import { NftModel } from "../domains/nfts/nft.model";
import { SnackbarModel } from "../domains/snackbar/snackbar.model";
import { TestStore } from "../domains/playground/playground.store";
import { UserModel } from "../domains/twitch-user/user.model";
import { OAuthModel } from "../domains/twitch-oauth/oauth.model";
import { Web3Model } from "../domains/web3/web3.model";
import { NavigationModel } from "../domains/navigation/navigation.model";
import { ThemeModel } from "../domains/theme/theme.model";
import { MintModel } from "../domains/mint/mint.model";
import { AuctionModel } from "../domains/auction/auction.model";

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
    this.auction = new AuctionModel(new MetaModel());

    this.mint = new MintModel(new MetaModel());

    this.theme = new ThemeModel();
    this.navigation = new NavigationModel();
    this.snackbar = new SnackbarModel();

    this.testStore = new TestStore();
  }
}
