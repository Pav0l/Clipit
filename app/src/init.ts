import { GraphQLClient } from "graphql-request";

import "./index.css";
import { AppRoute, pinataGatewayUri, twitchApiUri, twitchOAuthUri } from "./lib/constants";
import { AppModel } from "./domains/app/app.model";
import { Web3Controller } from "./domains/web3/web3.controller";
import { HttpClient } from "./lib/http-client/http-client";
import { TwitchApi } from "./lib/twitch-api/twitch-api.client";
import { LocalStorageClient } from "./lib/local-storage/local-storage.client";
import { OAuthController } from "./domains/twitch-oauth/oauth.controller";
import { ClipController } from "./domains/twitch-clips/clip.controller";
import { GameController } from "./domains/twitch-games/game.controller";
import { UserController } from "./domains/twitch-user/user.controller";
import { TwitchOAuthApiClient } from "./lib/twitch-oauth/twitch-oauth-api.client";
import { SubgraphClient } from "./lib/graphql/subgraph.client";
import { OffChainStorage } from "./lib/off-chain-storage/off-chain-storage.client";
import { NftController } from "./domains/nfts/nft.controller";
import { SnackbarController } from "./domains/snackbar/snackbar.controller";
import { ClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { ClipItContractCreator } from "./lib/contracts/ClipIt/clipit-contract.client";
import { AuctionContractCreator } from "./lib/contracts/AuctionHouse/auction-contract.client";

export function initSynchronous() {
  const storage = new LocalStorageClient();
  const model = new AppModel();

  model.navigation.setActiveRoute(location.pathname as AppRoute);

  const snackbar = new SnackbarController(model.snackbar);

  const offChainStorageApi = new OffChainStorage(
    new ClipItApiClient(new HttpClient(storage, CONFIG.clipItApiUrl), CONFIG.twitch.accessToken),
    new IpfsClient(new HttpClient(storage, pinataGatewayUri))
  );

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(storage, twitchOAuthUri), CONFIG.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(storage, twitchApiUri), CONFIG.twitch);
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));

  const authController = new OAuthController(model.auth, twitchOAuthApi, storage, CONFIG.twitch);
  const clipController = new ClipController(model.clip, snackbar, twitchApi);
  const gameController = new GameController(model.game, twitchApi);
  const userController = new UserController(model.user, twitchApi);
  const nftController = new NftController(model.nft, offChainStorageApi, subgraph, snackbar);

  const web3Controller = new Web3Controller(
    model.web3,
    offChainStorageApi,
    subgraph,
    snackbar,
    ClipItContractCreator,
    AuctionContractCreator,
    CONFIG
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

export async function initAsync({
  model,
  user,
  web3,
  nft,
}: {
  model: AppModel;
  user: UserController;
  web3: Web3Controller;
  nft: NftController;
}) {
  ////////////////////////////
  // twitch data init
  ////////////////////////////
  if (model.auth.isLoggedIn) {
    await user.getUser();
  }

  ////////////////////////////
  // web3 init
  ////////////////////////////

  await web3.connectMetaMaskIfNecessaryForConnectBtn();
  await nft.getClips();
}
