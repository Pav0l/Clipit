import { LocalStorageTestClient } from "../src/lib/local-storage/local-storage-test.client";
import { SnackbarController } from "../src/domains/snackbar/snackbar.controller";
import { ClipItApiTestClient } from "../src/lib/clipit-api/clipit-api-test.client";
import { IpfsTestClient } from "../src/lib/ipfs/ipfs-test.client";
import { TwitchApiTestClient } from "../src/lib/twitch-api/twitch-api-test.client";
import { SubgraphTestClient } from "../src/lib/graphql/subgraph-test.client";
import { ClipController } from "../src/domains/twitch-clips/clip.controller";
import { GameController } from "../src/domains/twitch-games/game.controller";
import { UserController } from "../src/domains/twitch-user/user.controller";
import { NftController } from "../src/domains/nfts/nft.controller";
import { Web3Controller } from "../src/domains/web3/web3.controller";
import { ClipItTestContractCreator } from "../src/lib/contracts/ClipIt/clipit-contract-test.client";
import { AuctionTestContractCreator } from "../src/lib/contracts/AuctionHouse/auction-contract-test.client";
import { IConfig } from "../src/app/config";
import { SentryClient } from "../src/lib/sentry/sentry.client";
import { ExtensionMode } from "../src/extension/domains/extension/extension.interfaces";
import { TwitchExtensionTestClient } from "../src/lib/twitch-extension/twitch-extension-test.client";
import { Logger } from "../src/lib/logger/logger";
import { ExtensionModel } from "../src/extension/domains/extension/extension.model";
import { ConfigUiController } from "../src/extension/domains/config/config-ui.controller";
import { BroadcasterAuthService } from "../src/extension/domains/broadcaster-auth/broadcaster-auth.service";
import { AuctionController } from "../src/domains/auction/auction.controller";
import { MintController } from "../src/domains/mint/mint.controller";
import { EthereumTestClientCreator } from "../src/lib/ethereum/ethereum-test.client";
import { StreamerUiController } from "../src/extension/domains/streamer/streamer-ui.controller";
import { initSynchronous, initAsync, AppInit, ClientsInit } from "../src/init";
import { NavigationTestClient } from "../src/domains/navigation/tests/navigation-test.client";
import { TwitchOAuthApiTestClient } from "../src/lib/twitch-oauth/twitch-oauth-api-test.client";
import { AnalyticsTestClient } from "../src/lib/firebase/analytics-test.client";

export function initExtensionTestSync(mode: ExtensionMode, testConfig: IConfig) {
  const twitch = new TwitchExtensionTestClient();
  const logger = new Logger(twitch);
  const sentry = new SentryClient("", true);
  const storage = new LocalStorageTestClient();

  const model = new ExtensionModel(mode);

  const broadcasterAuth = new BroadcasterAuthService();
  const snackbar = new SnackbarController(model.snackbar);
  const clipit = new ClipItApiTestClient();
  const ipfs = new IpfsTestClient();
  const twitchApi = new TwitchApiTestClient();
  const subgraph = new SubgraphTestClient();

  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);
  const game = new GameController(model.game, twitchApi, sentry);
  const user = new UserController(model.user, twitchApi, sentry);
  const nft = new NftController(model.nft, ipfs, subgraph, snackbar, sentry);
  const auction = new AuctionController(
    model.auction,
    AuctionTestContractCreator,
    ClipItTestContractCreator,
    snackbar,
    sentry,
    CONFIG
  );
  const mint = new MintController(model.mint, ClipItTestContractCreator, clipit, snackbar, sentry, CONFIG);

  const web3 = new Web3Controller(model.web3, EthereumTestClientCreator, snackbar, sentry);
  const streamerUi = new StreamerUiController(model, clip, game, web3, mint, auction, nft, snackbar, logger);
  const configUi = new ConfigUiController(model, web3);
  return {
    model,
    operations: {
      web3,
      clip,
      user,
      game,
      nft,
      snackbar,
      streamerUi,
      configUi,
      broadcasterAuth,
      mint,
      auction,
    },
    twitch,
    logger,
    sentry,
    storage,
  };
}

function initClientsForTests(): ClientsInit {
  const storage = new LocalStorageTestClient();
  const navigationClient = new NavigationTestClient();

  const twitchOAuthApi = new TwitchOAuthApiTestClient();
  const twitchApi = new TwitchApiTestClient();

  const clipit = new ClipItApiTestClient();
  const ipfs = new IpfsTestClient();
  const subgraph = new SubgraphTestClient();
  const analytics = new AnalyticsTestClient();

  const tokenContractCreator = ClipItTestContractCreator;
  const auctionContractCreator = AuctionTestContractCreator;
  const ethereumClientCreator = EthereumTestClientCreator;

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

export function initSynchronousWithTestClients(config: IConfig) {
  return initSynchronous(config, initClientsForTests());
}

export async function fullAppInitForTests(options: { runAfterSyncInit?: (init: AppInit) => Promise<void> } = {}) {
  const { runAfterSyncInit } = options;

  const init = initSynchronousWithTestClients(CONFIG);

  if (runAfterSyncInit) {
    await runAfterSyncInit(init);
  }

  await initAsync({
    model: init.model,
    navigator: init.operations.navigator,
    user: init.operations.user,
    oauth: init.operations.auth,
  });

  return init;
}
