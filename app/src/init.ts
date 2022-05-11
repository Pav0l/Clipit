import { GraphQLClient } from "graphql-request";

import { AppRoute, pinataGatewayUri, twitchApiUri, twitchOAuthUri } from "./lib/constants";
import { AppModel } from "./app/app.model";
import { Web3Controller } from "./domains/web3/web3.controller";
import { HttpClient } from "./lib/http-client/http-client";
import { TwitchApi, TwitchApiClient } from "./lib/twitch-api/twitch-api.client";
import { ILocalStorage, LocalStorageClient } from "./lib/local-storage/local-storage.client";
import { OAuthController } from "./domains/twitch-oauth/oauth.controller";
import { ClipController } from "./domains/twitch-clips/clip.controller";
import { GameController } from "./domains/twitch-games/game.controller";
import { UserController } from "./domains/twitch-user/user.controller";
import { IOauthApiClient, TwitchOAuthApiClient } from "./lib/twitch-oauth/twitch-oauth-api.client";
import { ISubgraphClient, SubgraphClient } from "./lib/graphql/subgraph.client";
import { NftController } from "./domains/nfts/nft.controller";
import { SnackbarController } from "./domains/snackbar/snackbar.controller";
import { ClipItApiClient, IClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { IIpfsClient, IpfsClient } from "./lib/ipfs/ipfs.client";
import { UiController } from "./app/ui.controller";
import { ClipItContractCreator, IClipItContractClient } from "./lib/contracts/ClipIt/clipit-contract.client";
import { AuctionContractCreator, IAuctionContractClient } from "./lib/contracts/AuctionHouse/auction-contract.client";
import { SentryClient } from "./lib/sentry/sentry.client";
import { AuctionController } from "./domains/auction/auction.controller";
import { MintController } from "./domains/mint/mint.controller";
import { EthereumClientCreator, IEthClient } from "./lib/ethereum/ethereum.client";
import { INavigationClient, NavigationClient } from "./domains/navigation/navigation.client";
import { NavigatorController } from "./domains/navigation/navigation.controller";
import { IConfig } from "./app/config";
import { EthereumProvider } from "./lib/ethereum/ethereum.types";
import { AnalyticsClient, IAnalytics } from "./lib/firebase/analytics.client";

export interface ClientsInit {
  storage: ILocalStorage;
  navigationClient: INavigationClient;
  twitchOAuthApi: IOauthApiClient;
  twitchApi: TwitchApiClient;
  clipit: IClipItApiClient;
  ipfs: IIpfsClient;
  subgraph: ISubgraphClient;
  analytics: IAnalytics;
  tokenContractCreator: (provider: EthereumProvider, address: string) => IClipItContractClient;
  auctionContractCreator: (provider: EthereumProvider, address: string) => IAuctionContractClient;
  ethereumClientCreator: (provider: EthereumProvider) => IEthClient;
}

export interface AppOperations {
  ui: UiController;
  web3: Web3Controller;
  clip: ClipController;
  user: UserController;
  game: GameController;
  auth: OAuthController;
  nft: NftController;
  mint: MintController;
  auction: AuctionController;
  snackbar: SnackbarController;
  navigator: NavigatorController;
}

export function initClients(config: IConfig): ClientsInit {
  const storage = new LocalStorageClient();
  const navigationClient = new NavigationClient(window);

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(twitchOAuthUri), config.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, {
    ...config.twitch,
    authScheme: "Bearer",
    withDefaultToken: false,
  });

  const clipit = new ClipItApiClient(new HttpClient(config.clipItApiUrl), storage);
  const ipfs = new IpfsClient(new HttpClient(pinataGatewayUri));
  const subgraph = new SubgraphClient(new GraphQLClient(config.subgraphUrl));
  const analytics = new AnalyticsClient(config.firebase);

  const tokenContractCreator = ClipItContractCreator;
  const auctionContractCreator = AuctionContractCreator;
  const ethereumClientCreator = EthereumClientCreator;

  return {
    storage,
    navigationClient,
    twitchOAuthApi,
    twitchApi,
    clipit,
    ipfs,
    subgraph,
    analytics,
    tokenContractCreator,
    auctionContractCreator,
    ethereumClientCreator,
  };
}

export interface AppInit {
  model: AppModel;
  operations: AppOperations;
  clients: {
    sentry: SentryClient;
    storage: ILocalStorage;
    clipit: IClipItApiClient;
    analytics: IAnalytics;
  };
}

export function initSynchronous(config: IConfig, clients: ClientsInit): AppInit {
  const sentry = new SentryClient(config.sentryDsn, config.isDevelopment);
  const model = new AppModel();
  // simple clients with no state that are usually mocked in tests
  const {
    storage,
    navigationClient,
    twitchOAuthApi,
    twitchApi,
    clipit,
    ipfs,
    subgraph,
    analytics,
    tokenContractCreator,
    auctionContractCreator,
    ethereumClientCreator,
  } = clients;

  const snackbar = new SnackbarController(model.snackbar);
  const auth = new OAuthController(model.auth, twitchOAuthApi, storage, sentry, config.twitch.clientId);
  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const game = new GameController(model.game, twitchApi, sentry);
  const user = new UserController(model.user, twitchApi, sentry);
  const nft = new NftController(model.nft, ipfs, subgraph, snackbar, sentry);
  const auction = new AuctionController(
    model.auction,
    auctionContractCreator,
    tokenContractCreator,
    snackbar,
    sentry,
    config
  );
  const mint = new MintController(model.mint, tokenContractCreator, clipit, snackbar, sentry, config);
  const web3 = new Web3Controller(model.web3, ethereumClientCreator, snackbar, sentry);

  const navigator = new NavigatorController(model.navigation, navigationClient, snackbar);
  const ui = new UiController(model, web3, auction, mint, nft, navigator, snackbar);

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
    clients: {
      sentry,
      storage,
      clipit,
      analytics,
    },
  };
}

export async function initAsync({ model, operations }: { model: AppModel; operations: AppOperations }) {
  const { auth, navigator, user, clip, web3 } = operations;
  // first we check if user is logged into twitch
  auth.checkTokenInStorage();
  // then we check which route we want to open
  navigator.validatePathForAppInit(window.location.pathname, window.location.href);

  ////////////////////////////
  // authorization
  ////////////////////////////
  if (navigator.isOnOAuthProtectedRoute) {
    auth.initOauthFlowIfNotAuthorized();
  }

  ////////////////////////////
  // route based init
  ////////////////////////////

  // oauth redirect first, so we init the referrer route later as well
  if (model.navigation.appRoute.route === AppRoute.OAUTH_REDIRECT) {
    auth.handleOAuth2Redirect(new URL(window.location.href));
    let referrer = model.auth.referrer;

    if (!referrer) {
      referrer = AppRoute.HOME;
    }
    navigator.validatePathForAppInit(referrer, referrer);
  }

  if (model.navigation.appRoute.route === AppRoute.CLIP) {
    const clipId = model.navigation.appRoute.params!.clipId;

    await clip.getClip(clipId);
  }

  if (model.navigation.appRoute.route === AppRoute.NFTS) {
    if (model.web3.isMetaMaskInstalled() && !model.web3.isProviderConnected()) {
      await web3.requestConnect();
    }

    // TODO handle provider not installed
  }

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
  // const params = new URL(window.location.href).searchParams;
  // const contentHash = params.get("contentHash");
  // if (contentHash !== null) {
  //   await nft.getClipByContentHash(contentHash);

  //   const clip = model.nft.getContentHashMetadata(contentHash);
  //   if (clip?.tokenId) {
  //     navigator.goToNft(clip.tokenId);
  //   }
  // }

  // await web3.requestEthAccounts();
  // await nft.getClips();
}
