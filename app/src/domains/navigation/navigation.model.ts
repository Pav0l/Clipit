import { makeAutoObservable } from "mobx";
import { AppRoute } from "../../lib/constants";

export class NavigationModel {
  activeRoute?: AppRoute;
  hoveredRoute?: AppRoute;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveRoute = (route: AppRoute) => {
    this.activeRoute = route;
  };

  setHoveredRoute = (route: AppRoute | undefined) => {
    this.hoveredRoute = route;
  };
}
