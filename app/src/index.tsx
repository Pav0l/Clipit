import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { GraphQLClient } from "graphql-request";

import "./index.css";
import {
  AppRoute,
  clipItUri,
  pinataGatewayUri,
  subgraphUrl,
  twitchApiUri,
  twitchAppClientId,
  twitchOAuthUri
} from "./lib/constants";
import { AppModel } from "./domains/app/app.model";
import { Web3Controller } from "./domains/web3/web3.controller";
import NftContainer from "./domains/nfts/components/NftContainer";
import NftsContainer from "./domains/nfts/components/NftsContainer";
import ClipDetailContainer from "./domains/twitch-clips/components/ClipDetailContainer";
import ClipsContainer from "./domains/twitch-clips/components/ClipsContainer";
import Snackbar from "./domains/snackbar/Snackbar";
import Home from "./components/home/Home";
import OAuth2Redirect from "./domains/twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import Marketplace from "./components/marketplace/Marketplace";
import Navbar from "./components/navbar/Navbar";
import ErrorBoundary from "./components/error/ErrorBoundry";
import Playground from "./domains/playground/Playground";
import { HttpClient } from "./lib/http-client/http-client";
import { TwitchApi } from "./lib/twitch-api/twitch-api.client";
import ThemeProvider from "./components/themeProvider/ThemeProvider";
import { defaultTheme } from "./components/themeProvider/theme";
import { LocalStorageClient } from "./lib/local-storage/local-storage.client";
import OAuthProtectedRoute from "./domains/twitch-oauth/OAuthProtected/OAuthProtectedRoute";
import { OAuthController } from "./domains/twitch-oauth/oauth.controller";
import { ClipController } from "./domains/twitch-clips/clip.controller";
import { GameController } from "./domains/twitch-games/game.controller";
import { UserController } from "./domains/twitch-user/user.controller";
import { TwitchOAuthApiClient } from "./lib/twitch-oauth/twitch-oauth-api.client";
import { SubgraphClient } from "./lib/graphql/subgraph.client";
import { OffChainStorage } from "./lib/off-chain-storage/off-chain-storage.client";
import { NftController } from "./domains/nfts/nft.controller";
import { SnackbarController } from "./domains/snackbar/snackbar.controller";

function initSynchronous() {
  const storage = new LocalStorageClient();
  const model = new AppModel();

  const snackbar = new SnackbarController(model.snackbar);

  const offChainStorageApi = new OffChainStorage(
    storage,
    clipItUri,
    pinataGatewayUri
  );

  const twitchOAuthApi = new TwitchOAuthApiClient(
    new HttpClient(storage, twitchOAuthUri)
  );
  const twitchApi = new TwitchApi(
    new HttpClient(storage, twitchApiUri),
    twitchAppClientId
  );
  const subgraph = new SubgraphClient(new GraphQLClient(subgraphUrl));

  const authController = new OAuthController(
    model.auth,
    twitchOAuthApi,
    storage
  );
  const clipController = new ClipController(model.clip, snackbar, twitchApi);
  const gameController = new GameController(model.game, twitchApi);
  const userController = new UserController(model.user, twitchApi);
  const nftController = new NftController(
    model.nft,
    offChainStorageApi,
    subgraph
  );

  const web3Controller = new Web3Controller(
    model.web3,
    offChainStorageApi,
    subgraph,
    snackbar
  );

  authController.checkTokenInStorage();

  return {
    model,
    operations: {
      web3: web3Controller,
      clip: clipController,
      user: userController,
      game: gameController,
      auth: authController,
      nft: nftController,
      snackbar: snackbar
    }
  };
}

async function initAsync({
  model,
  user
}: {
  model: AppModel;
  user: UserController;
}) {
  if (!model.auth.isLoggedIn) {
    // user logged out -> nothing to init
    return;
  }

  ////////////////////////////
  // twitch data init
  ////////////////////////////

  await user.getUser();
}

(async () => {
  try {
    const { model, operations } = initSynchronous();

    await initAsync({ model, user: operations.user });

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={defaultTheme}>
          <Router basename={AppRoute.HOME}>
            <Navbar
              model={{ web3: model.web3, auth: model.auth }}
              operations={{
                web3: operations.web3,
                auth: operations.auth,
                snackbar: operations.snackbar
              }}
            />

            <Snackbar
              model={{ snackbar: model.snackbar }}
              operations={operations.snackbar}
            />

            <Switch>
              <Route exact path={AppRoute.MARKETPLACE}>
                <Marketplace
                  model={{ nft: model.nft, web3: model.web3 }}
                  operations={operations.nft}
                />
              </Route>
              <OAuthProtectedRoute
                exact
                path={AppRoute.NFTS}
                model={{ auth: model.auth }}
                operations={{ auth: operations.auth }}
              >
                <NftsContainer
                  model={{ nft: model.nft, web3: model.web3 }}
                  operations={{ web3: operations.web3, nft: operations.nft }}
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
                  operations={operations.nft}
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
                      user: model.user
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
                      web3: model.web3
                    }}
                    operations={operations}
                  />
                </ErrorBoundary>
              </OAuthProtectedRoute>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect
                  controller={operations.auth}
                  model={model.auth}
                />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground
                  model={{
                    nft: model.nft
                  }}
                  operations={{
                    web3: operations.web3,
                    snackbar: operations.snackbar
                  }}
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
