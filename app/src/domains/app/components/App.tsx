import { observer } from "mobx-react-lite";
import { Box } from "@material-ui/core";
import Route from "route-parser";

import { AppModel } from "../app.model";
import { AppRoute } from "../../../lib/constants";
import Snackbar from "../../snackbar/Snackbar";
import Home from "../../../components/home/Home";
import OAuth2Redirect from "../../twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import ThemeProvider from "../../theme/components/ThemeProvider";
import ErrorWithRetry from "../../../components/error/Error";
import TermsOfService from "../../../components/terms/TermsOfService";
import { Web3Controller } from "../../web3/web3.controller";
import { OAuthController } from "../../twitch-oauth/oauth.controller";
import { SnackbarController } from "../../snackbar/snackbar.controller";
import { SentryClient } from "../../../lib/sentry/sentry.client";
import { NftController } from "../../nfts/nft.controller";
import { ClipController } from "../../twitch-clips/clip.controller";
import { GameController } from "../../twitch-games/game.controller";
import { UserController } from "../../twitch-user/user.controller";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import { SupportWidgetProvider } from "../../support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../theme/theme.constants";
import { UiController } from "../ui.controller";
import { NavigatorController } from "../../navigation/navigation.controller";
import { Demo } from "../../../components/demo/Demo";

interface Props {
  model: AppModel;
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
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
  },
  error: {
    height: "100vh",
  },
}));

const RouterX = observer(function RouterX({ model, operations }: Props) {
  let app: JSX.Element | null = null;

  const home = <Home model={model} operations={{ auth: operations.auth, navigator: operations.navigator }} />;

  switch (model.navigation.activeRoute) {
    case AppRoute.TERMS:
      app = <TermsOfService logoOnClick={operations.navigator.goToRoute} />;
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

  if (app === null) {
    if (model.navigation.activeRoute?.startsWith(AppRoute.DEMO)) {
      const route = new Route<{ clipCid: string }>(AppRoute.DEMO_CLIP);
      const matched = route.match(model.navigation.activeRoute);

      if (matched !== false) {
        app = (
          <Demo clipCid={matched.clipCid} videoUri={model.demo.ipfsUri} logoOnClick={operations.navigator.goToRoute} />
        );
      }
    }
  }

  // app is still null -> must be some unknown route, just go home
  if (app === null) {
    app = home;
  }

  return app;
});
