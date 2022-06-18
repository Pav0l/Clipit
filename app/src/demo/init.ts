import { AppRoute, twitchApiUri, twitchOAuthUri, demoClip, ipApiUri } from "../lib/constants";
import { DemoModel, Mode } from "./domains/app/demo.model";
import { HttpClient } from "../lib/http-client/http-client";
import { TwitchApi, TwitchApiClient } from "../lib/twitch-api/twitch-api.client";
import { ILocalStorage, LocalStorageClient } from "../lib/local-storage/local-storage.client";
import { OAuthController } from "../domains/twitch-oauth/oauth.controller";
import { UserController } from "../domains/twitch-user/user.controller";
import { IOauthApiClient, TwitchOAuthApiClient } from "../lib/twitch-oauth/twitch-oauth-api.client";
import { SnackbarController } from "../domains/snackbar/snackbar.controller";
import { SentryClient } from "../lib/sentry/sentry.client";
import { INavigationClient, NavigationClient } from "../domains/navigation/navigation.client";
import { NavigatorController } from "../domains/navigation/navigation.controller";
import { IConfig } from "../app/config";
import { ClipController } from "../domains/twitch-clips/clip.controller";
import { DatabaseClient, IDatabase } from "../lib/firebase/realtime-db/database.client";
import { TelemetryClient } from "../lib/telemetry/telemetry.client";
import { TelemetryService } from "./domains/telemetry/telemetry.service";
import { isValidEmail } from "../lib/strings/email";
import { IpApi, IpApiClient } from "../lib/ip/ip.client";

export interface DemoClientsInit {
  storage: ILocalStorage;
  navigationClient: INavigationClient;
  twitchOAuthApi: IOauthApiClient;
  twitchApi: TwitchApiClient;
  database: IDatabase;
  ipApi: IpApiClient;
}

export function initDemoClients(config: IConfig): DemoClientsInit {
  const storage = new LocalStorageClient();
  const navigationClient = new NavigationClient(window);

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(twitchOAuthUri), config.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, {
    ...config.twitch,
    authScheme: "Bearer",
    withDefaultToken: true,
  });
  const ipApi = new IpApi(new HttpClient(ipApiUri));

  const database = new DatabaseClient(config.firebase);

  return {
    storage,
    navigationClient,
    twitchOAuthApi,
    twitchApi,
    database,
    ipApi,
  };
}

export interface DemoInit {
  model: DemoModel;
  operations: {
    user: UserController;
    clip: ClipController;
    auth: OAuthController;
    snackbar: SnackbarController;
    navigator: NavigatorController;
  };
  clients: {
    sentry: SentryClient;
    telemetry: TelemetryService;
    ipApi: IpApiClient;
  };
}

export function initDemoSynchronous(config: IConfig, clients: DemoClientsInit): DemoInit {
  const sentry = new SentryClient(config.sentryDsn, config.isDevelopment);
  const model = new DemoModel();
  // simple clients with no state that are usually mocked in tests
  const { storage, navigationClient, twitchOAuthApi, twitchApi, database } = clients;

  const telemetry = new TelemetryService(model, new TelemetryClient(database, sentry));
  const snackbar = new SnackbarController(model.snackbar);
  const auth = new OAuthController(model.auth, twitchOAuthApi, storage, sentry, config.twitch.clientId);
  const user = new UserController(model.user, twitchApi, sentry);
  const clip = new ClipController(model.clip, snackbar, twitchApi, sentry);

  const navigator = new NavigatorController(model.navigation, navigationClient, snackbar);

  return {
    model,
    operations: {
      user,
      clip,
      auth,
      snackbar,
      navigator,
    },
    clients: {
      sentry,
      telemetry,
      ipApi: clients.ipApi,
    },
  };
}

export async function initDemoAsync({
  model,
  user,
  clip,
  navigator,
  oauth,
  telemetry,
  ipApi,
}: {
  model: DemoModel;
  user: UserController;
  clip: ClipController;
  navigator: NavigatorController;
  oauth: OAuthController;
  telemetry: TelemetryService;
  ipApi: IpApiClient;
}) {
  // first we check if user is logged into twitch
  oauth.checkTokenInStorage();
  // then we check which route we want to open
  navigator.validatePathForAppInit(window.location.pathname, window.location.href);

  ////////////////////////////
  // twitch data init
  ////////////////////////////
  if (model.auth.isLoggedIn) {
    await user.getUser();
  }

  const ip = await ipApi.query();
  if (ip.statusOk) {
    model.telemetry.setIp(ip.body);
  }

  ////////////////////////////
  // demo init
  ////////////////////////////
  // TODO persist slug/email in cookie/ls and load them if they exist and they're not in URL params
  const params = new URL(window.location.href).searchParams;

  const email = params.get("e");
  if (email !== null && isValidEmail(email)) {
    model.user.setUser({ email });
  }

  const slug = params.get("s");
  // slug is not fallback clip
  if (slug !== null && slug !== demoClip.id) {
    telemetry.loaded(slug);

    await clip.getClip(slug);
  } else {
    telemetry.loaded(email ?? "openedNoEmail");
  }

  const opener = params.get("r");
  if (opener !== null) {
    model.telemetry.setOpener(opener);
  }

  // cleanup query params
  navigator.goToRoute(window.location.pathname);

  ////////////////////////////
  // route based init
  ////////////////////////////

  // oauth redirect first, so we init the referrer route later as well
  if (model.navigation.appRoute.route === AppRoute.OAUTH_REDIRECT) {
    oauth.handleOAuth2Redirect(new URL(window.location.href));
    let referrer = model.auth.referrer;

    if (!referrer) {
      referrer = AppRoute.HOME;
    }
    navigator.validatePathForAppInit(referrer, referrer);
  }

  // load of specific demo clip
  if (model.navigation.appRoute.route === AppRoute.DEMO_CLIP) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clipId = model.navigation.appRoute.params!.clipId;

    await clip.getClip(clipId);

    // handle redirect from login
    const justLoggedIn = navigator.hasQueryToShowSnackbar();

    // also if user just logged in update telemetry
    if (justLoggedIn) {
      if (!model.user.id) {
        await user.getUser();
      }
      telemetry?.login(clipId);
    }

    const mode = navigator.getQueryMode();
    if (isValidMode(mode)) {
      model.setMode(mode);
    }
  }
}

function isValidMode(mode: unknown): mode is Mode {
  return mode != undefined && (mode === "video" || mode === "thumbnail");
}
