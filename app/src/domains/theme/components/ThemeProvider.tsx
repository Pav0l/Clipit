import { MuiThemeProvider } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { createAppTheme } from "../theme.constants";
import { ThemeModel } from "../theme.model";

function ThemeProvider({ children, model }: { children: JSX.Element | JSX.Element[]; model: ThemeModel }) {
  const theme = useMemo(() => createAppTheme(model.theme), [model.theme]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

export default observer(ThemeProvider);
