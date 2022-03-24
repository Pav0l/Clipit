import { makeAutoObservable } from "mobx";

export class NavigationModel {
  activeRoute?: string;
  hoveredRoute?: string;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveRoute = (route: string) => {
    this.activeRoute = route;
  };

  setHoveredRoute = (route: string | undefined) => {
    this.hoveredRoute = route;
  };
}
