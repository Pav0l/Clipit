import { makeAutoObservable } from "mobx";
import { ThemeName } from "./theme.constants";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getBrowserTheme = (): ThemeName => {
  let hasDarkMode;
  if (window && window.matchMedia) {
    hasDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return hasDarkMode ? ThemeName.Dark : ThemeName.Light;
};

export class ThemeModel {
  theme: ThemeName = ThemeName.Light; // getBrowserTheme();

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(value: ThemeName) {
    this.theme = value;
  }
}
