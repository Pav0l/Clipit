import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import "./index.css";
import { AppRoute } from "./lib/constants";
import NftContainer from "./domains/nfts/components/NftContainer";
import NftsContainer from "./domains/nfts/components/NftsContainer";
import ClipDetailContainer from "./domains/twitch-clips/components/ClipDetailContainer";
import ClipsContainer from "./domains/twitch-clips/components/ClipsContainer";
import Snackbar from "./domains/snackbar/Snackbar";
import Home from "./components/home/Home";
import OAuth2Redirect from "./domains/twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import Marketplace from "./components/marketplace/Marketplace";
import Navbar from "./domains/navigation/components/Navbar";
import ErrorBoundary from "./components/error/ErrorBoundry";
import Playground from "./domains/playground/Playground";
import ThemeProvider from "./components/themeProvider/ThemeProvider";
import { defaultTheme } from "./components/themeProvider/theme";
import OAuthProtectedRoute from "./domains/twitch-oauth/OAuthProtected/OAuthProtectedRoute";
import ErrorWithRetry from "./components/error/Error";
import { initSynchronous, initAsync } from "./init";

(async () => {
  try {
    const { model, operations } = initSynchronous();

    await initAsync({ model, user: operations.user, web3: operations.web3 });

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={defaultTheme}>
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

            <Switch>
              <Route exact path={AppRoute.MARKETPLACE}>
                <Marketplace model={{ nft: model.nft, web3: model.web3 }} operations={operations.nft} />
              </Route>

              <Route exact path={AppRoute.NFTS}>
                <NftsContainer
                  model={{ nft: model.nft, web3: model.web3, navigation: model.navigation }}
                  operations={{ web3: operations.web3, nft: operations.nft }}
                />
              </Route>

              <Route exact path={AppRoute.NFT}>
                <NftContainer
                  model={{ nft: model.nft, web3: model.web3 }}
                  operations={{ web3: operations.web3, nft: operations.nft }}
                />
              </Route>

              <OAuthProtectedRoute
                exact
                path={AppRoute.CLIPS}
                model={{ auth: model.auth }}
                operations={{ auth: operations.auth }}
              >
                <ErrorBoundary>
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
                <ErrorBoundary>
                  <ClipDetailContainer
                    model={{
                      clip: model.clip,
                      user: model.user,
                      game: model.game,
                      web3: model.web3,
                    }}
                    operations={operations}
                  />
                </ErrorBoundary>
              </OAuthProtectedRoute>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect controller={operations.auth} model={model.auth} />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground
                  model={{
                    nft: model.nft,
                  }}
                  operations={{
                    web3: operations.web3,
                    snackbar: operations.snackbar,
                  }}
                />
              </Route>
              <Route path={AppRoute.HOME}>
                <Home model={{ clip: model.clip }} operations={{ clip: operations.clip }} />
              </Route>

              {/* fallback route */}
              <Redirect to={AppRoute.HOME} />
            </Switch>
          </Router>
        </ThemeProvider>
      </React.StrictMode>,
      document.getElementById("root")
    );
  } catch (error) {
    // SENTRY

    ReactDOM.render(
      <React.StrictMode>
        <ErrorWithRetry text="Error while initializing app" withRetry={true} />
      </React.StrictMode>,
      document.getElementById("root")
    );
  }
})();
