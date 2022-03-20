import { observer } from "mobx-react-lite";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

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
          }}
          isDevelopment={CONFIG.isDevelopment}
        />

        <Snackbar model={{ snackbar: model.snackbar }} operations={operations.snackbar} />

        {appMetaData.isLoading ? (
          <FullPageLoader />
        ) : appMetaData.error ? (
          <ErrorWithRetry text={appMetaData.error.message} withRetry={true} />
        ) : (
          <Switch>
            <Route exact path={AppRoute.MARKETPLACE}>
              <Marketplace model={{ nft: model.nft, web3: model.web3 }} operations={operations.nft} />
            </Route>

            <Route exact path={AppRoute.NFTS}>
              <ErrorBoundary sentry={sentry}>
                <NftsContainer
                  model={{ nft: model.nft, web3: model.web3, navigation: model.navigation }}
                  operations={{ web3: operations.web3, nft: operations.nft }}
                />
              </ErrorBoundary>
            </Route>

            <Route exact path={AppRoute.NFT}>
              <NftContainer
                model={{ nft: model.nft, web3: model.web3, auction: model.auction }}
                operations={{ web3: operations.web3, nft: operations.nft, ui: operations.ui }}
                sentry={sentry}
              />
            </Route>

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
            <Route exact path={AppRoute.OAUTH_REDIRECT}>
              <OAuth2Redirect controller={operations.auth} model={model.auth} />
            </Route>
            <Route exact path={AppRoute.ABOUT}>
              <Playground model={model} operations={operations} />
            </Route>

            <Route exact path={AppRoute.TERMS}>
              <TermsOfService />
            </Route>

            <Route path={AppRoute.HOME}>
              <Home
                model={{ clip: model.clip, nft: model.nft, auth: model.auth }}
                operations={{ clip: operations.clip, auth: operations.auth }}
              />
            </Route>

            {/* fallback route */}
            <Redirect to={AppRoute.HOME} />
          </Switch>
        )}

        <Footer />
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
