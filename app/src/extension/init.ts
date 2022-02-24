import { GraphQLClient } from "graphql-request";
import { NftController } from "../domains/nfts/nft.controller";
import { SnackbarController } from "../domains/snackbar/snackbar.controller";
import { ClipController } from "../domains/twitch-clips/clip.controller";
import { GameController } from "../domains/twitch-games/game.controller";
import { UserController } from "../domains/twitch-user/user.controller";
import { Web3Controller } from "../domains/web3/web3.controller";
import { ClipItApiClient } from "../lib/clipit-api/clipit-api.client";
import { pinataGatewayUri, twitchApiUri } from "../lib/constants";
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
import { TwitchClient, TwitchExtensionClient } from "../lib/twitch-extension/twitch-extension.client";
import { ExtensionMode } from "./domains/extension/extension.interfaces";
import { ExtensionModel, IExtensionModel } from "./domains/extension/extension.model";
import { ALLOWED_PATHS } from "./domains/extension/extension.routes";
import { StreamerUiController } from "./domains/streamer/streamer-ui.controller";

export function initExtSynchronous(path: string) {
  let mode: ExtensionMode = "UNKNOWN";

  // Twitch => global var injected in index.html via <script> tag
  const twitch = new TwitchExtensionClient(Twitch.ext);
  const logger = new Logger(twitch);
  logger.log("extension config", CONFIG);

  const storage = new LocalStorageClient();
  const sentry = new SentryClient(CONFIG.sentryDsn, CONFIG.isDevelopment);
  const offChainStorage = new OffChainStorage(
    new ClipItApiClient(new HttpClient(storage, CONFIG.clipItApiUrl), CONFIG.twitch.secretKey),
    new IpfsClient(new HttpClient(storage, pinataGatewayUri))
  );
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));

  if (path.includes(ALLOWED_PATHS.PANEL)) {
    mode = "PANEL";
  } else if (path.includes(ALLOWED_PATHS.CONFIG)) {
    mode = "CONFIG";
  } else if (path.includes(ALLOWED_PATHS.STREAMER)) {
    mode = "STREAMER";
  }

  const model = new ExtensionModel(mode);
  const snackbar = new SnackbarController(model.snackbar);
  const twitchApi = new TwitchApi(new HttpClient(storage, twitchApiUri), CONFIG.twitch, "EXTENSION");

  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const game = new GameController(model.game, twitchApi, sentry);
  const user = new UserController(model.user, twitchApi, sentry);
  const nft = new NftController(model.nft, offChainStorage, subgraph, snackbar, sentry);
  const web3 = new Web3Controller(
    model.web3,
    offChainStorage,
    subgraph,
    snackbar,
    sentry,
    ClipItContractCreator,
    AuctionContractCreator,
    CONFIG
  );

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
  twitch,
  logger,
  storage,
}: {
  model: IExtensionModel;
  user: UserController;
  web3: Web3Controller;
  streamerUi: StreamerUiController;
  twitch: TwitchClient;
  logger: Logger;
  storage: LocalStorageClient;
}) {
  twitch.onContext((ctx) => logger.log("ctx", ctx));

  twitch.onError((err) => logger.log("twitch error", err));

  switch (model.mode) {
    case "STREAMER":
      await initStreamer({ user, web3, streamerUi, twitch, storage, logger });
      break;

    default:
      break;
  }
}

async function initStreamer({
  user,
  web3,
  streamerUi,
  storage,
  twitch,
  logger,
}: {
  user: UserController;
  web3: Web3Controller;
  streamerUi: StreamerUiController;
  storage: ILocalStorage;
  logger: Logger;
  twitch: TwitchClient;
}) {
  await web3.connectMetaMaskIfNecessaryForConnectBtn();

  // TODO handle auth
  twitch.onAuthorized(async (auth) => {
    logger.log("authorized", auth);
    // hax to store token for httpClient.authorizedExtensionRequest in TwitchApi
    storage.setItem(CONFIG.twitch.accessToken, auth.helixToken);
    // hax no.2 to use token for EBS requests to twitch
    storage.setItem(CONFIG.twitch.secretKey, auth.token);

    // remove the first character from the auth.userId opaque userId
    await user.getUser(getUserId(auth.userId));
  });

  streamerUi.initialize();
}

// TODO this will most likely not work in prod because auth.userId is OPAQUE id and not real one!
function getUserId(authUserId: string): string {
  if (authUserId.startsWith("U") || authUserId.startsWith("A")) {
    return authUserId.slice(1);
  }
  return authUserId;
}
