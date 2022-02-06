import { LocalStorageTestClient } from "../src/lib/local-storage/local-storage-test.client";
import { AppModel } from "../src/domains/app/app.model";
import { AppRoute } from "../src/lib/constants";
import { SnackbarController } from "../src/domains/snackbar/snackbar.controller";
import { OffChainStorage } from "../src/lib/off-chain-storage/off-chain-storage.client";
import { ClipItApiTestClient } from "../src/lib/clipit-api/clipit-api-test.client";
import { IpfsTestClient } from "../src/lib/ipfs/ipfs-test.client";
import { TwitchOAuthApiTestClient } from "../src/lib/twitch-oauth/twitch-oauth-api-test.client";
import { TwitchTestApi } from "../src/lib/twitch-api/twitch-api-test.client";
import { SubgraphTestClient } from "../src/lib/graphql/subgraph-test.client";
import { OAuthController } from "../src/domains/twitch-oauth/oauth.controller";
import { ClipController } from "../src/domains/twitch-clips/clip.controller";
import { GameController } from "../src/domains/twitch-games/game.controller";
import { UserController } from "../src/domains/twitch-user/user.controller";
import { NftController } from "../src/domains/nfts/nft.controller";
import { Web3Controller } from "../src/domains/web3/web3.controller";
import { ClipItTestContractCreator } from "../src/lib/contracts/ClipIt/clipit-contract-test.client";
import { AuctionTestContractCreator } from "../src/lib/contracts/AuctionHouse/auction-contract-test.client";
import { IConfig } from "../src/domains/app/config";

export function initTestSync(testConfig: IConfig) {
  const storage = new LocalStorageTestClient();
  const model = new AppModel();

  model.navigation.setActiveRoute(location.pathname as AppRoute);

  const snackbar = new SnackbarController(model.snackbar);

  const offChainStorageApi = new OffChainStorage(new ClipItApiTestClient(), new IpfsTestClient());

  const twitchOAuthApi = new TwitchOAuthApiTestClient();
  const twitchApi = new TwitchTestApi();
  const subgraph = new SubgraphTestClient();

  const authController = new OAuthController(model.auth, twitchOAuthApi, storage, testConfig.twitch);
  const clipController = new ClipController(model.clip, snackbar, twitchApi);
  const gameController = new GameController(model.game, twitchApi);
  const userController = new UserController(model.user, twitchApi);
  const nftController = new NftController(model.nft, offChainStorageApi, subgraph, snackbar);

  const web3Controller = new Web3Controller(
    model.web3,
    offChainStorageApi,
    subgraph,
    snackbar,
    ClipItTestContractCreator,
    AuctionTestContractCreator,
    testConfig
  );

  authController.checkTokenInStorage();

  return {
    model,
    operations: {
      web3: web3Controller,
      clip: clipController,
      user: userController,
      game: gameController,
      auth: authController,
      nft: nftController,
      snackbar: snackbar,
    },
  };
}