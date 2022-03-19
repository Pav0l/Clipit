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
import { SentryClient } from "./lib/sentry/sentry.client";

export function initSynchronous() {
  const sentry = new SentryClient(CONFIG.sentryDsn, CONFIG.isDevelopment);

  const storage = new LocalStorageClient();
  const model = new AppModel();

  model.navigation.setActiveRoute(location.pathname as AppRoute);

  const snackbar = new SnackbarController(model.snackbar);

  const offChainStorageApi = new OffChainStorage(
    new ClipItApiClient(new HttpClient(CONFIG.clipItApiUrl), storage),
    new IpfsClient(new HttpClient(pinataGatewayUri))
  );

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(twitchOAuthUri), CONFIG.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, CONFIG.twitch);
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));

  const authController = new OAuthController(model.auth, twitchOAuthApi, storage, sentry, CONFIG.twitch.clientId);
  const clipController = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const gameController = new GameController(model.game, twitchApi, sentry);
  const userController = new UserController(model.user, twitchApi, sentry);
  const nftController = new NftController(model.nft, offChainStorageApi, subgraph, snackbar, sentry);
  const web3Controller = new Web3Controller(
    model.web3,
    model.mint,
    offChainStorageApi,
    snackbar,
    sentry,
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
    sentry,
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

  // TODO clean this up somewhere to Nav ctrl or UI ctrl or refactor the to router based init
  const params = new URL(location.href).searchParams;
  const contentHash = params.get("contentHash");
  if (contentHash) {
    await nft.getClipByContentHash(contentHash);

    const clip = model.nft.getContentHashMetadata(contentHash);
    if (clip?.tokenId) {
      // TODO do not want to location.assign, just change history state and keep app state
      location.assign(location.origin + `/nfts/${clip.tokenId}`);
      // just wait a second with end of init till browser reloads
      await new Promise((res) => setTimeout(res, 1000));
      return;
    }
  }

  await web3.requestEthAccounts();
  await nft.getClips();
}
