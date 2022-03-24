import { GraphQLClient } from "graphql-request";

import { pinataGatewayUri, twitchApiUri, twitchOAuthUri } from "./lib/constants";
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
import { NftController } from "./domains/nfts/nft.controller";
import { SnackbarController } from "./domains/snackbar/snackbar.controller";
import { ClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { UiController } from "./domains/app/ui.controller";
import { ClipItContractCreator } from "./lib/contracts/ClipIt/clipit-contract.client";
import { AuctionContractCreator } from "./lib/contracts/AuctionHouse/auction-contract.client";
import { SentryClient } from "./lib/sentry/sentry.client";
import { AuctionController } from "./domains/auction/auction.controller";
import { MintController } from "./domains/mint/mint.controller";
import { EthereumClientCreator } from "./lib/ethereum/ethereum.client";
import { NavigationClient } from "./domains/navigation/navigation.client";
import { NavigatorController } from "./domains/navigation/navigation.controller";

export function initSynchronous() {
  const sentry = new SentryClient(CONFIG.sentryDsn, CONFIG.isDevelopment);

  const historyClient = new NavigationClient(window);
  const storage = new LocalStorageClient();
  const model = new AppModel();

  // TODO this is stupid - need to validate pathname before writing to model
  model.navigation.setActiveRoute(location.pathname);

  const snackbar = new SnackbarController(model.snackbar);

  const clipit = new ClipItApiClient(new HttpClient(CONFIG.clipItApiUrl), storage);
  const ipfs = new IpfsClient(new HttpClient(pinataGatewayUri));
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));
  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(twitchOAuthUri), CONFIG.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, CONFIG.twitch);

  const auth = new OAuthController(model.auth, twitchOAuthApi, storage, sentry, CONFIG.twitch.clientId);
  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const game = new GameController(model.game, twitchApi, sentry);
  const user = new UserController(model.user, twitchApi, sentry);
  const nft = new NftController(model.nft, ipfs, subgraph, snackbar, sentry);
  const auction = new AuctionController(
    model.auction,
    AuctionContractCreator,
    ClipItContractCreator,
    snackbar,
    sentry,
    CONFIG
  );
  const mint = new MintController(model.mint, ClipItContractCreator, clipit, snackbar, sentry, CONFIG);
  const web3 = new Web3Controller(model.web3, EthereumClientCreator, snackbar, sentry);

  const navigator = new NavigatorController(model.navigation, historyClient);
  const ui = new UiController(model, web3, auction, mint, nft, navigator, snackbar);

  auth.checkTokenInStorage();

  return {
    model,
    operations: {
      ui,
      web3,
      clip,
      user,
      game,
      auth,
      nft,
      mint,
      auction,
      snackbar,
      navigator,
    },
    sentry,
  };
}

export async function initAsync({
  model,
  user,
  web3,
  nft,
  navigator,
}: {
  model: AppModel;
  user: UserController;
  web3: Web3Controller;
  nft: NftController;
  navigator: NavigatorController;
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
  if (contentHash !== null) {
    await nft.getClipByContentHash(contentHash);

    const clip = model.nft.getContentHashMetadata(contentHash);
    if (clip?.tokenId) {
      navigator.goToNft(clip.tokenId);
    }
  }

  await web3.requestEthAccounts();
  await nft.getClips();
}
