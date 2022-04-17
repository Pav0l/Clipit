import { observer } from "mobx-react-lite";
import { Box } from "@material-ui/core";
import Route from "route-parser";

import { AppModel } from "../app.model";
import { AppRoute } from "../../lib/constants";
import Home from "../../components/home/Home";
import ErrorWithRetry from "../../components/error/Error";
import OAuth2Redirect from "../../domains/twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import ThemeProvider from "../../domains/theme/components/ThemeProvider";
import Terms from "../../components/terms/Terms";
import { OAuthController } from "../../domains/twitch-oauth/oauth.controller";
import { SentryClient } from "../../lib/sentry/sentry.client";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { SupportWidgetProvider } from "../../domains/support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import Snackbar from "../../domains/snackbar/Snackbar";
import { SnackbarController } from "../../domains/snackbar/snackbar.controller";

interface Props {
  model: AppModel;
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
    snackbar: SnackbarController;
  };
  sentry: SentryClient;
}

export const App = observer(function App(props: Props) {
  return (
    <SupportWidgetProvider>
      <ThemeProvider model={props.model.theme}>
        <StyledApp {...props} />
      </ThemeProvider>
    </SupportWidgetProvider>
  );
});

const StyledApp = observer(function App({ model, operations, sentry }: Props) {
  const classes = useStyles();
  const appMetaData = model.meta;

  return (
    <Box className={classes.app}>
      <Snackbar model={{ snackbar: model.snackbar }} operations={operations.snackbar} />

      {appMetaData.isLoading ? (
        <FullPageLoader />
      ) : appMetaData.error ? (
        <ErrorWithRetry text={appMetaData.error.message} withRetry={true} classNames={classes.error} />
      ) : (
        <RouterX model={model} operations={operations} sentry={sentry} />
      )}
    </Box>
  );
});

const useStyles = makeAppStyles((theme) => ({
  app: {
    backgroundColor: theme.colors.background_primary,
    // TODO this should be 100vh, so that we never have content that does not fix the screen? (ToS, Errors, Loaders,...)
  },
  error: {
    height: "100vh",
  },
}));

const RouterX = observer(function RouterX({ model, operations }: Props) {
  let app: JSX.Element | null = null;

  const home = <div>hello home</div>;

  switch (model.navigation.activeRoute) {
    case AppRoute.TERMS:
      app = <Terms logoOnClick={operations.navigator.goToRoute} />;
      break;

    case AppRoute.OAUTH_REDIRECT:
      app = (
        <OAuth2Redirect model={model.auth} operations={{ oauth: operations.auth, navigator: operations.navigator }} />
      );
      break;

    case AppRoute.HOME:
      app = home;
      break;
  }

  // app is still null -> must be some unknown route, just go home
  if (app === null) {
    app = home;
  }

  return app;
});
