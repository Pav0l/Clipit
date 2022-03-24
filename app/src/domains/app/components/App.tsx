import { observer } from "mobx-react-lite";
import { BrowserRouter as Router, Switch, Route as ReactRoute, Redirect } from "react-router-dom";
import Route from "route-parser";

import { AppModel } from "../app.model";
import { AppRoute } from "../../../lib/constants";
import NftContainer from "../../nfts/components/NftContainer";
import NftsContainer from "../../nfts/components/NftsContainer";
import ClipDetailContainer from "../../twitch-clips/components/ClipDetailContainer";
import ClipsContainer from "../../twitch-clips/components/ClipsContainer";
import Snackbar from "../../snackbar/Snackbar";
import Home from "../../../components/home/Home";
import OAuth2Redirect from "../../twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import Marketplace from "../../../components/marketplace/Marketplace";
import Navbar from "../../navigation/components/Navbar";
import ErrorBoundary from "../../../components/error/ErrorBoundry";
import Playground from "../../playground/Playground";
import ThemeProvider from "../../theme/components/ThemeProvider";
import OAuthProtectedRoute from "../../twitch-oauth/OAuthProtected/OAuthProtectedRoute";
import ErrorWithRetry from "../../../components/error/Error";
import Footer from "../../../components/footer/Footer";
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

interface Props {
  model: AppModel;
  operations: {
    web3: Web3Controller;
    auth: OAuthController;
    snackbar: SnackbarController;
    nft: NftController;
    clip: ClipController;
    game: GameController;
    user: UserController;
    ui: UiController;
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
    <div className={classes.app}>
      <Router basename={AppRoute.HOME}>
        <Navbar
          model={{ web3: model.web3, auth: model.auth, navigation: model.navigation }}
          operations={{
            web3: operations.web3,
            auth: operations.auth,
            snackbar: operations.snackbar,
            navigator: operations.navigator,
          }}
          isDevelopment={CONFIG.isDevelopment}
        />

        <Snackbar model={{ snackbar: model.snackbar }} operations={operations.snackbar} />

        {appMetaData.isLoading ? (
          <FullPageLoader />
        ) : appMetaData.error ? (
          <ErrorWithRetry text={appMetaData.error.message} withRetry={true} />
        ) : (
          <RouterX model={model} operations={operations} sentry={sentry} />
        )}

        <Footer
          operations={{
            navigator: operations.navigator,
          }}
        />
      </Router>
    </div>
  );
});

const useStyles = makeAppStyles((theme) => ({
  app: {
    backgroundColor: theme.colors.background_primary,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
}));

const RouterX = observer(function RouterX({ model, operations, sentry }: Props) {
  let app: JSX.Element | null = null;
  console.log("[LOG] active route:", model.navigation.activeRoute);

  switch (model.navigation.activeRoute) {
    case AppRoute.ABOUT:
      app = <Playground model={model} operations={operations} />;
      break;

    case AppRoute.TERMS:
      app = <TermsOfService />;
      break;

    case AppRoute.MARKETPLACE:
      app = (
        <Marketplace
          model={{ nft: model.nft, web3: model.web3 }}
          operations={{ navigator: operations.navigator, nft: operations.nft }}
        />
      );
      break;
  }

  if (app === null) {
    if (model.navigation.activeRoute?.startsWith(AppRoute.NFTS)) {
      const route = new Route<{ tokenId: string }>(AppRoute.NFT);
      const matched = route.match(model.navigation.activeRoute);

      if (matched !== false) {
        app = (
          <NftContainer
            tokenId={matched.tokenId}
            model={{ nft: model.nft, web3: model.web3, auction: model.auction }}
            operations={{ web3: operations.web3, nft: operations.nft, ui: operations.ui }}
            sentry={sentry}
          />
        );
      }
    }
  }

  if (app === null) {
    return (
      <Switch>
        <ReactRoute exact path={AppRoute.NFTS}>
          <ErrorBoundary sentry={sentry}>
            <NftsContainer
              model={{ nft: model.nft, web3: model.web3, navigation: model.navigation }}
              operations={{ web3: operations.web3, nft: operations.nft, navigator: operations.navigator }}
            />
          </ErrorBoundary>
        </ReactRoute>

        <OAuthProtectedRoute
          exact
          path={AppRoute.CLIPS}
          model={{ auth: model.auth }}
          operations={{ auth: operations.auth }}
        >
          <ErrorBoundary sentry={sentry}>
            <ClipsContainer
              model={{
                clip: model.clip,
                user: model.user,
              }}
              operations={{
                clip: operations.clip,
                game: operations.game,
                user: operations.user,
              }}
            />
          </ErrorBoundary>
        </OAuthProtectedRoute>
        <OAuthProtectedRoute
          exact
          path={AppRoute.CLIP}
          model={{ auth: model.auth }}
          operations={{ auth: operations.auth }}
        >
          <ErrorBoundary sentry={sentry}>
            <ClipDetailContainer
              model={{
                clip: model.clip,
                user: model.user,
                game: model.game,
                web3: model.web3,
                nft: model.nft,
                mint: model.mint,
              }}
              operations={operations}
            />
          </ErrorBoundary>
        </OAuthProtectedRoute>
        <ReactRoute exact path={AppRoute.OAUTH_REDIRECT}>
          <OAuth2Redirect controller={operations.auth} model={model.auth} />
        </ReactRoute>

        <ReactRoute path={AppRoute.HOME}>
          <Home
            model={{ clip: model.clip, nft: model.nft, auth: model.auth }}
            operations={{ clip: operations.clip, auth: operations.auth, navigator: operations.navigator }}
          />
        </ReactRoute>

        {/* fallback route */}
        <Redirect to={AppRoute.HOME} />
      </Switch>
    );
  }

  return app;
});
