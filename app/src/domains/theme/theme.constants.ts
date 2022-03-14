import { ThemeOptions } from "@material-ui/core";

export enum ThemeName {
  Light = "light",
  Dark = "dark",
}

interface ThemePalette {
  [ThemeName.Dark]: ThemeOptions;
  [ThemeName.Light]: ThemeOptions;
}

export const themePalette: ThemePalette = {
  [ThemeName.Light]: {
    overrides: {
      MuiButton: {
        containedPrimary: {
          backgroundColor: "#2176FF",
        },
      },
    },
  },
  [ThemeName.Dark]: {
    overrides: {
      MuiButton: {
        containedPrimary: {
          backgroundColor: "#2176FF",
        },
      },
    },
  },
};

export const getBrowserTheme = (): ThemeName => {
  let hasDarkMode;
  if (window && window.matchMedia) {
    hasDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return hasDarkMode ? ThemeName.Dark : ThemeName.Light;
};
