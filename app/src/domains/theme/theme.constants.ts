import { ThemeOptions, Theme, makeStyles, createTheme } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ColorTokens, darkColors, lightColors } from "./color.constants";

export enum ThemeName {
  Light = "light",
  Dark = "dark",
}

const commonThemeOpts: ThemeOptions = {};
const darkOpts: ThemeOptions = {
  overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: darkColors.primaryBlue,
      },
    },
  },
};
const lightOpts: ThemeOptions = {
  overrides: {
    MuiButton: {
      containedPrimary: {
        backgroundColor: lightColors.primaryBlue,
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
