import { makeAutoObservable } from "mobx";
import { AppRoute } from "../../lib/constants";

export class NavigationModel {
  activeRoute?: AppRoute;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveRoute = (route: AppRoute) => {
    this.activeRoute = route;
  };
}
