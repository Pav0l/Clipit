import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { GraphQLClient } from "graphql-request";

import "./index.css";
import { AppRoute, pinataGatewayUri, twitchApiUri, twitchOAuthUri } from "./lib/constants";
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
import Navbar from "./domains/navigation/components/Navbar";
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
import { ClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { ClipItContractCreator } from "./lib/contracts/ClipIt/clipit-contract.client";
import { AuctionContractCreator } from "./lib/contracts/AuctionHouse/auction-contract.client";
import ErrorWithRetry from "./components/error/Error";

function initSynchronous() {
  const storage = new LocalStorageClient();
  const model = new AppModel();

  model.navigation.setActiveRoute(location.pathname as AppRoute);

  const snackbar = new SnackbarController(model.snackbar);

  const offChainStorageApi = new OffChainStorage(
    new ClipItApiClient(new HttpClient(storage, CONFIG.clipItApiUrl), CONFIG.twitch.accessToken),
    new IpfsClient(new HttpClient(storage, pinataGatewayUri))
  );

  const twitchOAuthApi = new TwitchOAuthApiClient(new HttpClient(storage, twitchOAuthUri), CONFIG.twitch.clientId);
  const twitchApi = new TwitchApi(new HttpClient(storage, twitchApiUri), CONFIG.twitch);
  const subgraph = new SubgraphClient(new GraphQLClient(CONFIG.subgraphUrl));

  const authController = new OAuthController(model.auth, twitchOAuthApi, storage, CONFIG.twitch);
  const clipController = new ClipController(model.clip, snackbar, twitchApi);
  const gameController = new GameController(model.game, twitchApi);
  const userController = new UserController(model.user, twitchApi);
  const nftController = new NftController(model.nft, offChainStorageApi, subgraph, snackbar);

  const web3Controller = new Web3Controller(
    model.web3,
    offChainStorageApi,
    subgraph,
    snackbar,
    ClipItContractCreator,
    AuctionContractCreator,
    CONFIG
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
      snackbar: snackbar,
    },
  };
}

async function initAsync({ model, user, web3 }: { model: AppModel; user: UserController; web3: Web3Controller }) {
  if (!model.auth.isLoggedIn) {
    // user logged out -> nothing to init
    return;
  }

  ////////////////////////////
  // twitch data init
  ////////////////////////////

  await user.getUser();

  ////////////////////////////
  // web3 init
  ////////////////////////////

  await web3.connectMetaMaskIfNecessaryForConnectBtn();
}

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
