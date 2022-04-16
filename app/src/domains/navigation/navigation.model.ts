import { makeAutoObservable } from "mobx";
import { AppRoute } from "../../lib/constants";

interface ParsedAppRoute {
  route: AppRoute;
  // these types could be better -> different params types based on AppRoute
  params: { [param: string]: string } | null;
}

export class NavigationModel {
  activeRoute?: string;
  hoveredRoute?: string;
  appRoute: ParsedAppRoute = { route: AppRoute.HOME, params: null };

  constructor() {
    makeAutoObservable(this);
  }

  setActiveRoute = (route: string) => {
    this.activeRoute = route;
  };

  setHoveredRoute = (route: string | undefined) => {
    this.hoveredRoute = route;
  };

  setAppRoute = (route: ParsedAppRoute) => {
    this.appRoute = route;
  };
}
