import Route from "route-parser";

import { AppRoute } from "../../lib/constants";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { INavigationClient } from "./navigation.client";
import { NavigationModel } from "./navigation.model";

enum NavQuery {
  HI = "hi",
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

  goToRoute = (route: string, href?: string) => {
    this.model.setActiveRoute(route);
    this.client.push(href ?? route);
  };

  // href is used to pass on any query string params / hashes forward
  validatePathForAppInit(pathname: string, href: string) {
    const routes = Object.values(AppRoute);

    for (const appRoute of routes) {
      const matched = new Route(appRoute).match(pathname);
      if (matched) {
        this.model.setAppRoute({ route: appRoute, params: matched });
        return this.goToRoute(pathname, href);
      }
    }
    // no AppRoute match -> redirect to Home
    this.model.setAppRoute({ route: AppRoute.HOME, params: null });
    this.goToRoute(AppRoute.HOME);
  }

  hasQueryToShowSnackbar() {
    const url = new URL(window.location.href).searchParams;
    const ok = url.get(NavQuery.HI);
    if (ok) {
      // TODO improve copy, style? and timing of the snack
      this.snackbar.sendInfo("Thanks for your trust! We'll get in touch...");
      this.client.push(window.location.pathname);
    }
  }

  generateDemoLoginRedirect(slug: string) {
    return `/demo/${slug}?${NavQuery.HI}=ok`;
  }

  get isOnOAuthProtectedRoute() {
    return !!this.model.activeRoute?.startsWith(AppRoute.CLIPS);
  }
}
