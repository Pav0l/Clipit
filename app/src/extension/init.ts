import { GraphQLClient } from "graphql-request";
import { NftController } from "../domains/nfts/nft.controller";
import { SnackbarController } from "../domains/snackbar/snackbar.controller";
import { ClipController } from "../domains/twitch-clips/clip.controller";
import { GameController } from "../domains/twitch-games/game.controller";
import { UserController } from "../domains/twitch-user/user.controller";
import { Web3Controller } from "../domains/web3/web3.controller";
import { ClipItApiClient } from "../lib/clipit-api/clipit-api.client";
import { ebsTokenKey, extensionHelixTokenKey, pinataGatewayUri, twitchApiUri } from "../lib/constants";
import { AuctionContractCreator } from "../lib/contracts/AuctionHouse/auction-contract.client";
import { ClipItContractCreator } from "../lib/contracts/ClipIt/clipit-contract.client";
import { SubgraphClient } from "../lib/graphql/subgraph.client";
import { HttpClient } from "../lib/http-client/http-client";
import { IpfsClient } from "../lib/ipfs/ipfs.client";
import { ILocalStorage, LocalStorageClient } from "../lib/local-storage/local-storage.client";
import { Logger } from "../lib/logger/logger";
import { OffChainStorage } from "../lib/off-chain-storage/off-chain-storage.client";
import { SentryClient } from "../lib/sentry/sentry.client";
import { TwitchApi } from "../lib/twitch-api/twitch-api.client";
import { TwitchExtensionQueryParams } from "../lib/twitch-extension/interfaces";
import { TwitchClient, TwitchExtensionClient } from "../lib/twitch-extension/twitch-extension.client";
import { BroadcasterAuthService } from "./domains/broadcaster-auth/broadcaster-auth.service";
import { ConfigUiController } from "./domains/config/config-ui.controller";
import { ExtensionMode } from "./domains/extension/extension.interfaces";
import { ExtensionModel, IExtensionModel } from "./domains/extension/extension.model";
import { StreamerUiController } from "./domains/streamer/streamer-ui.controller";

export function initExtSynchronous(options: TwitchExtensionQueryParams) {
  let mode: ExtensionMode = "UNKNOWN";

  // Twitch => global var injected in index.html via <script> tag
  const twitch = new TwitchExtensionClient(Twitch.ext);
  const logger = new Logger(twitch);
  logger.log("extension config", CONFIG);

  const storage = new LocalStorageClient();
  const sentry = new SentryClient(CONFIG.sentryDsn, CONFIG.isDevelopment);
  const offChainStorage = new OffChainStorage(
    new ClipItApiClient(new HttpClient(CONFIG.clipItApiUrl), storage, "Ebs"),
    new IpfsClient(new HttpClient(pinataGatewayUri))
  );
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));

  switch (options.mode) {
    case "viewer":
      mode = "PANEL";
      break;
    case "config":
      mode = "CONFIG";
      break;
    case "dashboard":
      mode = "STREAMER";
      break;
  }

  const model = new ExtensionModel(mode);
  const snackbar = new SnackbarController(model.snackbar);
  const broadcasterAuth = new BroadcasterAuthService();
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, CONFIG.twitch, "Extension");

  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const game = new GameController(model.game, twitchApi, sentry);
  const user = new UserController(model.user, twitchApi, sentry);
  const nft = new NftController(model.nft, offChainStorage, subgraph, snackbar, sentry);
  const web3 = new Web3Controller(
    model.web3,
    offChainStorage,
    snackbar,
    sentry,
    ClipItContractCreator,
    AuctionContractCreator,
    CONFIG
  );

  const configUi = new ConfigUiController(model, web3);
  const streamerUi = new StreamerUiController(model, clip, game, web3, nft, snackbar, logger);

  return {
    model,
    operations: {
      nft,
      web3,
      snackbar,
      clip,
      user,
      streamerUi,
      configUi,
      broadcasterAuth,
    },
    logger,
    sentry,
    storage,
    twitch,
  };
}

export async function initExtAsync({
  model,
  web3,
  user,
  streamerUi,
  configUi,
  broadcasterAuth,
  twitch,
  logger,
  storage,
}: {
  model: IExtensionModel;
  user: UserController;
  web3: Web3Controller;
  streamerUi: StreamerUiController;
  configUi: ConfigUiController;
  broadcasterAuth: BroadcasterAuthService;
  twitch: TwitchClient;
  logger: Logger;
  storage: LocalStorageClient;
}) {
  twitch.onContext((ctx) => logger.log("ctx", ctx));

  twitch.onError((err) => logger.log("twitch error", err));

  switch (model.mode) {
    case "STREAMER":
      await broadcasterAsyncInit({ user, web3, broadcasterAuth, twitch, storage, logger });
      streamerUi.initialize();
      break;
    case "CONFIG":
      await broadcasterAsyncInit({ user, web3, broadcasterAuth, twitch, storage, logger });
      configUi.initialize();
      break;
    case "PANEL": // TODO
    default:
      break;
  }
}

async function broadcasterAsyncInit({
  user,
  web3,
  broadcasterAuth,
  storage,
  twitch,
  logger,
}: {
  user: UserController;
  web3: Web3Controller;
  broadcasterAuth: BroadcasterAuthService;
  storage: ILocalStorage;
  logger: Logger;
  twitch: TwitchClient;
}) {
  await web3.requestEthAccounts();

  twitch.onAuthorized(async (auth) => {
    logger.log("authorized", auth);
    // hax to store token for httpClient.authorizedExtensionRequest in TwitchApi
    storage.setItem(extensionHelixTokenKey, auth.helixToken);
    // hax no.2 to use token for EBS requests to twitch
    storage.setItem(ebsTokenKey, auth.token);

    const data = broadcasterAuth.verifyBroadcaster(auth.token);
    await user.getUser(data.userId);
  });
}
