import { MuiThemeProvider, Theme } from "@material-ui/core";
import { observer } from "mobx-react-lite";

function ThemeProvider({
  children,
  theme
}: {
  children: JSX.Element | JSX.Element[];
  theme: Theme;
}) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default observer(ThemeProvider);
