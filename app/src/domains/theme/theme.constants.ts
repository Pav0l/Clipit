import { ThemeOptions, Theme, createTheme, makeStyles } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ColorTokens, darkColors, lightColors } from "./color.constants";

export enum ThemeName {
  Light = "light",
  Dark = "dark",
}

const commonThemeOpts: ThemeOptions = {
  typography: {
    fontFamily: ["Montserrat", "sans-serif"].join(","),
    fontSize: 16,
  },
};
const darkOpts: ThemeOptions = {
  palette: {
    type: "light", // TODO replace with "dark" once ready
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: darkColors.text_primary,
      },
    },
  },
};
const lightOpts: ThemeOptions = {
  palette: {
    type: "light",
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: lightColors.text_primary,
      },
    },
  },
};

export function createAppTheme(name: ThemeName): Theme {
  const common = createTheme(commonThemeOpts);
  switch (name) {
    case ThemeName.Light:
      return createTheme(lightOpts, common, { colors: lightColors });
    case ThemeName.Dark:
      return createTheme(darkOpts, common, { colors: darkColors });
  }
}

interface AppTheme extends Theme {
  colors: ColorTokens;
}

export function makeAppStyles(styles: Styles<AppTheme, Record<string, unknown>>) {
  return makeStyles<AppTheme>(styles);
}
