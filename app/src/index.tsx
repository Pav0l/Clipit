import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { toJS } from "mobx";

import "./index.css";
import { AppRoute, clipItUri, cloudFlareGatewayUri } from "./lib/constants";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { AppModel } from "./domains/app/app.model";
import { AppController } from "./domains/app/app.controller";
import NftContainer from "./domains/nfts/NftContainer";
import NftsContainer from "./domains/nfts/NftsContainer";
import ClipDetailContainer from "./domains/twitch-clips/ClipDetailContainer";
import ClipsContainer from "./domains/twitch-clips/ClipsContainer";
import Snackbar from "./lib/snackbar/Snackbar";
import { snackbarClient } from "./lib/snackbar/snackbar.client";
import Home from "./components/home/Home";
import OAuth2Redirect from "./lib/twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import Marketplace from "./components/marketplace/Marketplace";
import Navbar from "./components/navbar/Navbar";
import ErrorBoundary from "./components/error/ErrorBoundry";
import Playground from "./domains/playground/Playground";
import { ClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { HttpClient } from "./lib/http-client";
import { twitchApiClient } from "./lib/twitch-api/twitch-api.client";
import ThemeProvider from "./components/themeProvider/ThemeProvider";
import { defaultTheme } from "./components/themeProvider/theme";
import { LocalStorage } from "./lib/local-storage";
import OAuthProtectedRoute from "./lib/twitch-oauth/OAuthProtected/OAuthProtectedRoute";

async function initializeApp() {
  const model = new AppModel();
  const app = new AppController(
    model,
    snackbarClient,
    new ClipItApiClient(new HttpClient(clipItUri)),
    twitchApiClient,
    new IpfsClient(new HttpClient(cloudFlareGatewayUri)),
    new LocalStorage()
  );

  return { model, operations: app };
}

(async () => {
  try {
    // initialize config
    // initialize logger
    const { model, operations } = await initializeApp();

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={defaultTheme}>
          <Router basename="/">
            <Navbar
              model={{ eth: model.eth, auth: model.auth }}
              operations={operations}
              snackbar={snackbarClient}
            />

            <Snackbar model={{ snackbar: model.snackbar }} />

            <Switch>
              <Route exact path={AppRoute.MARKETPLACE}>
                <Marketplace />
              </Route>
              <OAuthProtectedRoute
                exact
                path={AppRoute.NFTS}
                model={{ auth: model.auth }}
                operations={{ auth: operations.auth }}
              >
                <NftsContainer
                  model={{ nft: model.nft }}
                  operations={operations}
                />
              </OAuthProtectedRoute>
              <OAuthProtectedRoute
                exact
                path={AppRoute.NFT}
                model={{ auth: model.auth }}
                operations={{ auth: operations.auth }}
              >
                <NftContainer
                  model={{ nft: model.nft }}
                  operations={operations}
                />
              </OAuthProtectedRoute>
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
                      game: model.game
                    }}
                    operations={{
                      clip: operations.clip,
                      game: operations.game,
                      user: operations.user
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
                      nft: model.nft,
                      eth: model.eth
                    }}
                    operations={operations}
                  />
                </ErrorBoundary>
              </OAuthProtectedRoute>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect operations={operations.auth} />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground
                  model={{
                    nft: model.nft
                  }}
                  operations={operations}
                  snackbar={snackbarClient}
                />
              </Route>
              <Route path={AppRoute.HOME}>
                <Home
                  model={{ clip: model.clip }}
                  operations={{ clip: operations.clip }}
                />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </React.StrictMode>,
      document.getElementById("root")
    );
  } catch (error) {
    ReactDOM.render(
      <React.StrictMode>
        {/* TODO */}
        <div>Error while initializing app</div>
      </React.StrictMode>,
      document.getElementById("root")
    );
  }
})();
