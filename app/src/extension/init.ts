import { GraphQLClient } from "graphql-request";
import { NftController } from "../domains/nfts/nft.controller";
import { SnackbarController } from "../domains/snackbar/snackbar.controller";
import { ClipController } from "../domains/twitch-clips/clip.controller";
import { Web3Controller } from "../domains/web3/web3.controller";
import { ClipItApiClient } from "../lib/clipit-api/clipit-api.client";
import { pinataGatewayUri, twitchApiUri } from "../lib/constants";
import { AuctionContractCreator } from "../lib/contracts/AuctionHouse/auction-contract.client";
import { ClipItContractCreator } from "../lib/contracts/ClipIt/clipit-contract.client";
import { SubgraphClient } from "../lib/graphql/subgraph.client";
import { HttpClient } from "../lib/http-client/http-client";
import { IpfsClient } from "../lib/ipfs/ipfs.client";
import { LocalStorageClient } from "../lib/local-storage/local-storage.client";
import { Logger } from "../lib/logger/logger";
import { OffChainStorage } from "../lib/off-chain-storage/off-chain-storage.client";
import { SentryClient } from "../lib/sentry/sentry.client";
import { TwitchApi } from "../lib/twitch-api/twitch-api.client";
import { ExtensionMode } from "./domains/extension/extension.interfaces";
import { ExtensionModel, IExtensionModel } from "./domains/extension/extension.model";
import { ALLOWED_PATHS } from "./domains/extension/extension.routes";
import { StreamerUiController } from "./domains/streamer/streamer-ui.controller";

export function initExtSynchronous(path: string, twitchSDK: typeof Twitch.ext) {
  let mode: ExtensionMode = "UNKNOWN";

  const logger = new Logger(twitchSDK.rig);
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

  const streamerUi = new StreamerUiController(model, clip, web3);

  return {
    model,
    operations: {
      nft,
      web3,
      snackbar,
      clip,
      streamerUi,
    },
    logger,
    sentry,
    storage,
  };
}

export async function initExtAsync({
  model,
  web3,
  streamerUi,
  twitch,
  logger,
  storage,
}: {
  model: IExtensionModel;
  web3: Web3Controller;
  streamerUi: StreamerUiController;
  twitch: typeof Twitch.ext;
  logger: Logger;
  storage: LocalStorageClient;
}) {
  // TODO handle auth
  twitch.onAuthorized((auth) => {
    logger.log("authorized", auth);
    // hax to store token for httpClient.authorizedExtensionRequest in TwitchApi
    storage.setItem(CONFIG.twitch.accessToken, auth.helixToken);
  });
  twitch.onContext((ctx) => logger.log("ctx", ctx));

  twitch.onError((err) => logger.log("twitch error", err));

  switch (model.mode) {
    case "STREAMER":
      await initStreamer(web3, streamerUi);
      break;

    default:
      break;
  }
}

async function initStreamer(web3: Web3Controller, streamerUi: StreamerUiController) {
  await web3.connectMetaMaskIfNecessaryForConnectBtn();

  streamerUi.initialize();
}
