import { createTheme, MuiThemeProvider } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { ThemeName, themePalette } from "../theme.constants";

function ThemeProvider({ children, themeName }: { children: JSX.Element | JSX.Element[]; themeName: ThemeName }) {
  const theme = useMemo(() => createTheme(themePalette[themeName]), [themeName]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default observer(ThemeProvider);
