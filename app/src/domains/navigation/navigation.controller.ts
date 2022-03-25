import Route from "route-parser";

import { AppRoute } from "../../lib/constants";
import { INavigationClient } from "./navigation.client";
import { NavigationModel } from "./navigation.model";

export class NavigatorController {
  constructor(private model: NavigationModel, private client: INavigationClient) {}

  goToClip = (clipId: string) => {
    this.goToRoute(`${AppRoute.CLIPS}/${clipId}`);
  };

  goToNft = (tokenId: string) => {
    this.goToRoute(`${AppRoute.NFTS}/${tokenId}`);
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
        return this.goToRoute(pathname, href);
      }
    }
    // no AppRoute match -> redirect to Home
    this.goToRoute(AppRoute.HOME);
  }

  get isOnOAuthProtectedRoute() {
    return !!this.model.activeRoute?.startsWith(AppRoute.CLIPS);
  }
}
