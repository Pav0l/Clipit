import Route from "route-parser";

import { AppRoute } from "../../lib/constants";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { INavigationClient } from "./navigation.client";
import { NavigationModel } from "./navigation.model";

enum NavQuery {
  HI = "hi",
  MODE = "mode",
}

export class NavigatorController {
  constructor(private model: NavigationModel, private client: INavigationClient, private snackbar: SnackbarClient) {
    this.client.onPopState(this.goToRoute);
  }

  goToClip = (clipId: string) => {
    this.goToRoute(`${AppRoute.CLIPS}/${clipId}`);
  };

  goToNft = (tokenId: string) => {
    this.goToRoute(`${AppRoute.NFTS}/${tokenId}`);
  };

  goToDemoClip = (clipId: string) => {
    this.model.setAppRoute({ route: AppRoute.DEMO, params: { clipId } });
    this.goToRoute(`${AppRoute.DEMO}/${clipId}`);
  };

  // TODO ideally this is private and we expose proper interface for every supported route
  goToRoute = (route: string, href?: string) => {
    this.model.setActiveRoute(route);
    this.client.push(href ?? route);
  };

  // href is used to pass on any query string params / hashes forward
  validatePathForAppInit(pathname: string, href: string) {
    const routes = Object.values(AppRoute);

    // fallback AppRoute is Home
    this.model.setAppRoute({ route: AppRoute.HOME, params: null });
    this.goToRoute(AppRoute.HOME);

    for (const appRoute of routes) {
      const matched = new Route(appRoute).match(pathname);
      if (matched) {
        this.model.setAppRoute({ route: appRoute, params: matched });
        this.goToRoute(pathname, href);
      }
    }
  }

  hasQueryToShowSnackbar() {
    const url = new URL(window.location.href).searchParams;
    const ok = url.get(NavQuery.HI);
    if (ok) {
      this.snackbar.sendInfo("Thanks for your trust! We'll get in touch...", null); // keep visible forever
      this.client.push(window.location.pathname);
      return true;
    }
    return false;
  }

  getQueryMode() {
    const url = new URL(window.location.href).searchParams;
    return url.get(NavQuery.MODE);
  }

  generateDemoLoginRedirect(slug: string) {
    return `/demo/${slug}?${NavQuery.HI}=ok`;
  }

  get isOnOAuthProtectedRoute() {
    return !!this.model.activeRoute?.startsWith(AppRoute.CLIPS);
  }
}
