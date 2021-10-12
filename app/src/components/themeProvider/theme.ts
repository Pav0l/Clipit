import { createTheme, ThemeOptions } from "@material-ui/core";


export const defaultThemeOpts: ThemeOptions = {
  // TODO
  overrides: {
    "MuiButton": {
      containedPrimary: {
        backgroundColor: "#2176FF"
      }
    }

  },
  palette: {
    background: {
    },
    text: {
    }
  }
};

export const defaultTheme = createTheme(defaultThemeOpts);
