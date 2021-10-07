import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./index.css";
import { AppRoute, clipItUri, cloudFlareGatewayUri } from "./lib/constants";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { getTwitchOAuth2AuthorizeUrl } from "./lib/twitch-oauth/twitch-oauth.utils";

import { appModel } from "./domains/app/app.model";
import { StoreProvider } from "./components/storeProvider/StoreProvider";

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

async function initializeApp() {
  const app = new AppController(
    appModel,
    snackbarClient,
    new ClipItApiClient(new HttpClient(clipItUri)),
    twitchApiClient,
    new IpfsClient(new HttpClient(cloudFlareGatewayUri))
  );

  return { model: appModel, operations: app };
}

(async () => {
  try {
    // initialize config
    // initialize logger
    const { model, operations } = await initializeApp();

    ReactDOM.render(
      <React.StrictMode>
        <StoreProvider>
          <Router basename="/">
            <Navbar
              redirect={getTwitchOAuth2AuthorizeUrl}
              model={{ nft: model.nft }}
              operations={operations}
            />

            <Snackbar model={{ snackbar: model.snackbar }} />

            <Switch>
              <Route exact path={AppRoute.MARKETPLACE}>
                <Marketplace />
              </Route>
              <Route exact path={AppRoute.NFTS}>
                {/* TODO this route needs to be auth protected */}
                <NftsContainer
                  model={{ nft: model.nft }}
                  operations={operations}
                />
              </Route>
              <Route exact path={AppRoute.NFT}>
                {/* TODO this route needs to be auth protected */}
                <NftContainer
                  model={{ nft: model.nft }}
                  operations={operations}
                />
              </Route>
              <Route exact path={AppRoute.CLIPS}>
                <ErrorBoundary>
                  {/* TODO this route needs to be auth protected */}
                  <ClipsContainer
                    model={{
                      clip: model.clipsStore,
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
              </Route>
              <Route exact path={AppRoute.CLIP}>
                <ErrorBoundary>
                  {/* TODO this route needs to be auth protected */}
                  <ClipDetailContainer
                    model={{
                      clip: model.clipsStore,
                      user: model.user,
                      game: model.game,
                      nft: model.nft
                    }}
                    operations={operations}
                    snackbar={snackbarClient}
                  />
                </ErrorBoundary>
              </Route>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground />
              </Route>
              <Route path={AppRoute.HOME}>
                <Home
                  model={{ clip: model.clipsStore }}
                  operations={{ clip: operations.clip }}
                />
              </Route>
            </Switch>
          </Router>
        </StoreProvider>
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
