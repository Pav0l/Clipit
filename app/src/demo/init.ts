import { AppRoute, twitchApiUri, twitchOAuthUri, demoClip } from "../lib/constants";
import { DemoModel } from "./domains/app/demo.model";
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
import { IConfig } from "../domains/app/config";
import { AnalyticsClient, IAnalytics } from "../lib/firebase/analytics.client";
import { ClipController } from "../domains/twitch-clips/clip.controller";

export interface DemoClientsInit {
  storage: ILocalStorage;
  navigationClient: INavigationClient;
  twitchOAuthApi: IOauthApiClient;
  twitchApi: TwitchApiClient;
  analytics: IAnalytics;
}

export function initDemoClients(config: IConfig): DemoClientsInit {
  const storage = new LocalStorageClient();
  const navigationClient = new NavigationClient(window);

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(twitchOAuthUri), config.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(twitchApiUri), storage, config.twitch);

  const analytics = new AnalyticsClient(config.firebase);

  return {
    storage,
    navigationClient,
    twitchOAuthApi,
    twitchApi,
    analytics,
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
    analytics: IAnalytics;
  };
}

export function initDemoSynchronous(config: IConfig, clients: DemoClientsInit): DemoInit {
  const sentry = new SentryClient(config.sentryDsn, config.isDevelopment);
  const model = new DemoModel();
  // simple clients with no state that are usually mocked in tests
  const { storage, navigationClient, twitchOAuthApi, twitchApi, analytics } = clients;

  const snackbar = new SnackbarController(model.snackbar);
  const auth = new OAuthController(model.auth, twitchOAuthApi, storage, sentry, analytics, config.twitch.clientId);
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
      analytics,
    },
  };
}

export async function initDemoAsync({
  model,
  user,
  clip,
  navigator,
  oauth,
  analytics,
}: {
  model: DemoModel;
  user: UserController;
  clip: ClipController;
  navigator: NavigatorController;
  oauth: OAuthController;
  analytics: IAnalytics;
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

  ////////////////////////////
  // demo init
  ////////////////////////////
  const params = new URL(window.location.href).searchParams;
  const slug = params.get("slug");

  // slug is not fallback clip
  if (slug !== null && slug !== demoClip.id) {
    analytics.setProperty("slug", slug);

    await clip.getClip(slug);
  }

  ////////////////////////////
  // route based init
  ////////////////////////////
  if (model.navigation.appRoute.route === AppRoute.DEMO_CLIP) {
    await clip.getClip(model.navigation.appRoute.params!.clipId);
  }
}
