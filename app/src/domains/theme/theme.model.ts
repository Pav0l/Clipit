import { makeAutoObservable } from "mobx";
import { getBrowserTheme, ThemeName } from "./theme.constants";

export class ThemeModel {
  theme: ThemeName = getBrowserTheme();

  constructor() {
    makeAutoObservable(this);
  }

  setTheme(value: ThemeName) {
    this.theme = value;
  }
}
