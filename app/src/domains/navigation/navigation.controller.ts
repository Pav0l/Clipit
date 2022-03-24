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

  goToMarketplace = () => {
    this.goToRoute(AppRoute.MARKETPLACE);
  };

  goToNft = (tokenId: string) => {
    this.goToRoute(`/nfts/${tokenId}`);
  };

  goToNfts = () => {
    this.goToRoute(AppRoute.NFTS);
  };

  goToRoute = (route: string) => {
    this.model.setActiveRoute(route);
    this.client.push(route);
  };
}
