import { makeAutoObservable } from "mobx";
import { ThemeName } from "./theme.constants";

const getBrowserTheme = (): ThemeName => {
  let hasDarkMode;
  if (window && window.matchMedia) {
    hasDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return hasDarkMode ? ThemeName.Dark : ThemeName.Light;
};

export class ThemeModel {
  theme: ThemeName = getBrowserTheme();

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(value: ThemeName) {
    this.theme = value;
  }
}
