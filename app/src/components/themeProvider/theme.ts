import { createTheme, ThemeOptions } from "@material-ui/core";


export const defaultThemeOpts: ThemeOptions = {
  // TODO
  overrides: {

  },
  palette: {
    background: {
    },
    text: {
      // primary: "#2176FF",
      // secondary: "#F79824",
      // hint: "#31393C"
    }
  }
};

export const defaultTheme = createTheme(defaultThemeOpts);
