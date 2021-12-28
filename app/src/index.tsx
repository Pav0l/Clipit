import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./index.css";
import {
  AppRoute,
  clipItUri,
  cloudFlareGatewayUri,
  twitchApiUri,
  twitchAppClientId
} from "./lib/constants";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { AppModel } from "./domains/app/app.model";
import { Web3Controller } from "./domains/app/app.controller";
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
import { HttpClient } from "./lib/http-client/http-client";
import { TwitchApi } from "./lib/twitch-api/twitch-api.client";
import ThemeProvider from "./components/themeProvider/ThemeProvider";
import { defaultTheme } from "./components/themeProvider/theme";
import { LocalStorage } from "./lib/local-storage";
import OAuthProtectedRoute from "./lib/twitch-oauth/OAuthProtected/OAuthProtectedRoute";
import { OAuthController } from "./lib/twitch-oauth/oauth.controller";
import { ClipController } from "./domains/twitch-clips/clip.controller";
import { GameController } from "./domains/twitch-games/game.controller";
import { UserController } from "./domains/twitch-user/user.controller";

function initSynchronous() {
  const storage = new LocalStorage();
  const model = new AppModel();

  const clipItApi = new ClipItApiClient(new HttpClient(storage, clipItUri));
  const ipfsApi = new IpfsClient(new HttpClient(storage, cloudFlareGatewayUri));
  const twitchApi = new TwitchApi(
    new HttpClient(storage, twitchApiUri),
    twitchAppClientId
  );

  const authController = new OAuthController(model.auth, storage);
  if (location.pathname.includes(AppRoute.OAUTH_REDIRECT)) {
    authController.handleOAuth2Redirect(new URL(location.href));
  }

  const clipController = new ClipController(
    model.clip,
    snackbarClient,
    twitchApi
  );
  const gameController = new GameController(model.game, twitchApi);
  const userController = new UserController(model.user, twitchApi);

  const web3Controller = new Web3Controller(
    model.eth,
    model.nft,
    snackbarClient,
    clipItApi,
    ipfsApi
  );

  authController.checkTokenInStorage();

  return {
    model,
    operations: {
      web3: web3Controller,
      clip: clipController,
      user: userController,
      game: gameController,
      auth: authController
    }
  };
}

(async () => {
  try {
    const { model, operations } = initSynchronous();

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={defaultTheme}>
          <Router basename={AppRoute.HOME}>
            <Navbar
              model={{ eth: model.eth, auth: model.auth }}
              operations={{ web3: operations.web3, auth: operations.auth }}
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
                  operations={operations.web3}
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
                  operations={operations.web3}
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
                      nft: model.nft
                    }}
                    operations={operations}
                  />
                </ErrorBoundary>
              </OAuthProtectedRoute>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect referrer={model.auth.referrer} />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground
                  model={{
                    nft: model.nft
                  }}
                  operations={operations.web3}
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
