import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./index.css";
import { AppRoute, clipItUri, cloudFlareGatewayUri } from "./lib/constants";
import { IpfsClient } from "./lib/ipfs/ipfs.client";
import { getTwitchOAuth2AuthorizeUrl } from "./lib/twitch-oauth/twitch-oauth.utils";

import { store } from "./store/root.store";
import { StoreProvider } from "./store/StoreProvider";

import Clips from "./domains/twitch-clips/Clips";
import ClipDetail from "./domains/twitch-clips/ClipDetail";
import NftContainer from "./domains/nfts/NftContainer";

import Home from "./components/home/Home";
import OAuth2Redirect from "./lib/twitch-oauth/OAuth2Redirect/OAuth2Redirect";
import Marketplace from "./components/marketplace/Marketplace";
import Navbar from "./components/navbar/Navbar";

import Snackbar from "./domains/snackbar/Snackbar";
import ErrorBoundary from "./modules/error/ErrorBoundry";
import Playground from "./modules/playground/Playground";
import { ClipItApiClient } from "./lib/clipit-api/clipit-api.client";
import { HttpClient } from "./lib/http-client";
import { AppController } from "./domains/app/app.controller";
import NftsContainer from "./domains/nfts/NftsContainer";
import { snackbarClient } from "./domains/snackbar/snackbar.client";

async function initializeApp() {
  const model = store;

  const app = new AppController(
    model,
    snackbarClient,
    new ClipItApiClient(new HttpClient(clipItUri)),
    new IpfsClient(new HttpClient(cloudFlareGatewayUri))
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
        <StoreProvider>
          <Router basename="/">
            <Navbar redirect={getTwitchOAuth2AuthorizeUrl} />

            <Snackbar model={{ snackbar: model.snackbar }} />

            <Switch>
              <Route exact path={AppRoute.MARKETPLACE}>
                <Marketplace />
              </Route>
              <Route exact path={AppRoute.NFTS}>
                {/* TODO this route needs to be auth protected */}
                <NftsContainer
                  model={{ nft: model.nftStore }}
                  operations={operations}
                />
              </Route>
              <Route exact path={AppRoute.NFT}>
                {/* TODO this route needs to be auth protected */}
                <NftContainer
                  model={{ nft: model.nftStore }}
                  operations={operations}
                />
              </Route>
              <Route exact path={AppRoute.CLIPS}>
                <ErrorBoundary>
                  {/* TODO this route needs to be auth protected */}
                  <Clips />
                </ErrorBoundary>
              </Route>
              <Route exact path={AppRoute.CLIP}>
                <ErrorBoundary>
                  {/* TODO this route needs to be auth protected */}
                  <ClipDetail />
                </ErrorBoundary>
              </Route>
              <Route exact path={AppRoute.OAUTH_REDIRECT}>
                <OAuth2Redirect />
              </Route>
              <Route exact path={AppRoute.ABOUT}>
                <Playground />
              </Route>
              <Route path={AppRoute.HOME}>
                <Home />
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
