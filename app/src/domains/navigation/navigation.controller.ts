import { AppRoute } from "../../lib/constants";
import { INavigationClient } from "./navigation.client";
import { NavigationModel } from "./navigation.model";

export class NavigatorController {
  constructor(private model: NavigationModel, private client: INavigationClient) {}

  goToHome = () => {
    this.goToRoute(AppRoute.HOME);
  };

  goToAbout = () => {
    this.goToRoute(AppRoute.ABOUT);
  };

  goToTerms = () => {
    this.goToRoute(AppRoute.TERMS);
  };

  goToNft = (tokenId: string) => {
    this.goToRoute(`/nfts/${tokenId}`);
  };

  goToRoute = (route: string) => {
    this.model.setActiveRoute(route);
    this.client.push(route);
  };
}
